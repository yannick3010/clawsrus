#!/bin/bash
# ClawsRUs — User Provisioning Script
# Usage: ./provision-user.sh <customer-id> <email> <persona> <tier> [onboarding_payload_b64]
# Note: OPENAI_API_KEY is read from the environment (set in /opt/clawsrus/.env)

set -euo pipefail

CUSTOMER_ID="${1:-}"
CUSTOMER_EMAIL="${2:-}"
PERSONA="${3:-}"
TIER="${4:-}"
ONBOARDING_PAYLOAD_B64="${5:-}"

if [ -z "$CUSTOMER_ID" ] || [ -z "$CUSTOMER_EMAIL" ] || [ -z "$PERSONA" ] || [ -z "$TIER" ]; then
    echo "Usage: ./provision-user.sh <customer-id> <email> <persona> <tier> [onboarding_payload_b64]"
    echo "Example: ./provision-user.sh user-123 john@example.com personal-assistant standard"
    exit 1
fi

if [ -z "$OPENAI_API_KEY" ]; then
    echo "Error: OPENAI_API_KEY environment variable is not set"
    exit 1
fi

BASE_DIR="/opt/clawsrus/customers"
TEMPLATE_DIR="/opt/clawsrus/templates"
APP_ORIGIN="${NEXT_PUBLIC_APP_URL:-http://localhost:3000}"
OPENCLAW_IMAGE="${OPENCLAW_IMAGE:-clawsrus/openclaw-runtime:2026.2.17-r1}"
OPENCLAW_DOCKER_NETWORK="${OPENCLAW_DOCKER_NETWORK:-clawsrus-network}"
OPENCLAW_GATEWAY_PORT="${OPENCLAW_GATEWAY_PORT:-18789}"
OPENCLAW_READY_TIMEOUT_SECONDS="${OPENCLAW_READY_TIMEOUT_SECONDS:-90}"
ONBOARDING_BLOCK_START="<!-- CLAWSRUS_ONBOARDING_CONTEXT_START -->"
ONBOARDING_BLOCK_END="<!-- CLAWSRUS_ONBOARDING_CONTEXT_END -->"

PREFERRED_NAME=""
CUSTOMER_ROLE=""
HELP_TOPICS_JSON="[]"
COMMUNICATION_STYLE=""
TOP_PRIORITIES_JSON="[]"

sanitize_single_line() {
    local VALUE=$1
    printf '%s' "$VALUE" | tr '\r\n' ' ' | sed -E 's/[[:space:]]+/ /g; s/^ //; s/ $//'
}

escape_sed_replacement() {
    local VALUE=$1
    printf '%s' "$VALUE" | sed -e 's/[\\/&]/\\&/g'
}

fallback_name_from_email() {
    local email=$1
    local fallback="${email%@*}"

    if [ -z "$fallback" ] || [ "$fallback" = "$email" ]; then
        fallback="$email"
    fi

    printf '%s' "$fallback"
}

decode_base64() {
    local PAYLOAD=$1
    local decoded=""

    if decoded=$(printf '%s' "$PAYLOAD" | base64 --decode 2>/dev/null); then
        printf '%s' "$decoded"
        return 0
    fi

    if decoded=$(printf '%s' "$PAYLOAD" | base64 -d 2>/dev/null); then
        printf '%s' "$decoded"
        return 0
    fi

    if decoded=$(printf '%s' "$PAYLOAD" | base64 -D 2>/dev/null); then
        printf '%s' "$decoded"
        return 0
    fi

    return 1
}

parse_onboarding_payload() {
    local PAYLOAD_B64=$1
    local decoded_payload=""

    if [ -z "$PAYLOAD_B64" ]; then
        return 0
    fi

    if ! decoded_payload=$(decode_base64 "$PAYLOAD_B64"); then
        echo "WARNING: Failed to decode onboarding payload for $CUSTOMER_ID; proceeding with defaults"
        return 0
    fi

    if ! printf '%s' "$decoded_payload" | jq -e . >/dev/null 2>&1; then
        echo "WARNING: Onboarding payload is not valid JSON for $CUSTOMER_ID; proceeding with defaults"
        return 0
    fi

    PREFERRED_NAME=$(printf '%s' "$decoded_payload" | jq -r '.preferred_name // empty' 2>/dev/null || true)
    CUSTOMER_ROLE=$(printf '%s' "$decoded_payload" | jq -r '.role // empty' 2>/dev/null || true)
    COMMUNICATION_STYLE=$(printf '%s' "$decoded_payload" | jq -r '.communication_style // empty' 2>/dev/null || true)
    HELP_TOPICS_JSON=$(printf '%s' "$decoded_payload" | jq -c '(.help_topics // []) | if type == "array" then map(tostring) else [] end' 2>/dev/null || echo "[]")
    TOP_PRIORITIES_JSON=$(printf '%s' "$decoded_payload" | jq -c '(.top_priorities // []) | if type == "array" then map(tostring) else [] end' 2>/dev/null || echo "[]")

    PREFERRED_NAME=$(sanitize_single_line "$PREFERRED_NAME")
    CUSTOMER_ROLE=$(sanitize_single_line "$CUSTOMER_ROLE")
    COMMUNICATION_STYLE=$(sanitize_single_line "$COMMUNICATION_STYLE")
}

format_json_list_for_display() {
    local JSON_VALUE=$1
    local formatted=""

    formatted=$(printf '%s' "$JSON_VALUE" | jq -r '
      if type != "array" then
        "Not provided"
      else
        [ .[] | tostring
          | gsub("[\\r\\n]+"; " ")
          | gsub("\\s+"; " ")
          | sub("^\\s+"; "")
          | sub("\\s+$"; "")
          | select(length > 0)
        ] as $items
        | if ($items | length) > 0 then ($items | join(", ")) else "Not provided" end
      end
    ' 2>/dev/null || true)

    if [ -z "$formatted" ]; then
        formatted="Not provided"
    fi

    printf '%s' "$formatted"
}

upsert_onboarding_context_block() {
    local USER_FILE=$1
    local DISPLAY_ROLE=$2
    local DISPLAY_HELP_TOPICS=$3
    local DISPLAY_COMMUNICATION_STYLE=$4
    local DISPLAY_TOP_PRIORITIES=$5
    local tmp_file

    tmp_file=$(mktemp)

    awk -v start="$ONBOARDING_BLOCK_START" -v end="$ONBOARDING_BLOCK_END" '
      BEGIN { in_block = 0 }
      index($0, start) { in_block = 1; next }
      index($0, end) { in_block = 0; next }
      !in_block { print }
    ' "$USER_FILE" > "$tmp_file"

    mv "$tmp_file" "$USER_FILE"

    cat >> "$USER_FILE" <<EOF

$ONBOARDING_BLOCK_START
## Provisioned Signup Context

- **Role / Industry:** $DISPLAY_ROLE
- **Help topics:** $DISPLAY_HELP_TOPICS
- **Communication style:** $DISPLAY_COMMUNICATION_STYLE
- **Top priorities:** $DISPLAY_TOP_PRIORITIES
$ONBOARDING_BLOCK_END
EOF
}

generate_gateway_token() {
    if command -v openssl >/dev/null 2>&1; then
        openssl rand -hex 32
        return
    fi

    if [ -r /dev/urandom ]; then
        od -An -N32 -tx1 /dev/urandom | tr -d ' \n'
        return
    fi

    date +%s%N
}

persist_gateway_token() {
    local token=$1

    if [ -z "${SUPABASE_URL:-}" ] || [ -z "${SUPABASE_SERVICE_KEY:-}" ]; then
        echo "Skipping gateway token sync (SUPABASE_URL/SUPABASE_SERVICE_KEY not set)"
        return 0
    fi

    local response_file
    response_file=$(mktemp)
    local payload
    payload=$(jq -nc --arg gateway_token "$token" --arg updated_at "$(date -Iseconds)" \
      '{gateway_token: $gateway_token, updated_at: $updated_at}')

    local status_code
    status_code=$(curl -sS -o "$response_file" -w "%{http_code}" \
      -X PATCH "$SUPABASE_URL/rest/v1/users?id=eq.${CUSTOMER_ID}" \
      -H "apikey: $SUPABASE_SERVICE_KEY" \
      -H "Authorization: Bearer $SUPABASE_SERVICE_KEY" \
      -H "Content-Type: application/json" \
      -d "$payload")

    if [[ "$status_code" =~ ^2 ]]; then
        echo "Synced gateway token to Supabase for $CUSTOMER_ID"
        rm -f "$response_file"
        return 0
    fi

    if grep -Eq '"code":"42703"|"code":"PGRST204"|gateway_token' "$response_file"; then
        echo "Skipping gateway token sync (users.gateway_token column not present yet)"
        rm -f "$response_file"
        return 0
    fi

    echo "WARNING: Failed to sync gateway token for $CUSTOMER_ID (HTTP $status_code)"
    cat "$response_file" || true
    rm -f "$response_file"
    return 0
}

wait_for_gateway() {
    local container_name=$1
    local deadline=$(( $(date +%s) + OPENCLAW_READY_TIMEOUT_SECONDS ))

    while [ "$(date +%s)" -lt "$deadline" ]; do
        if ! docker ps --format '{{.Names}}' | grep -qx "$container_name"; then
            sleep 2
            continue
        fi

        local container_ip
        container_ip=$(docker inspect -f '{{range .NetworkSettings.Networks}}{{if .IPAddress}}{{.IPAddress}}{{end}}{{end}}' "$container_name" | awk '{print $1}')
        if [ -z "$container_ip" ]; then
            sleep 2
            continue
        fi

        local status_code
        status_code=$(curl -s -o /dev/null --max-time 2 -w "%{http_code}" "http://${container_ip}:${OPENCLAW_GATEWAY_PORT}/openclaw/" || true)
        if [ "$status_code" != "000" ]; then
            echo "Gateway reachable at ${container_ip}:${OPENCLAW_GATEWAY_PORT} (HTTP ${status_code})"
            return 0
        fi

        sleep 2
    done

    return 1
}

echo "Provisioning $CUSTOMER_ID ($PERSONA, $TIER)..."

# Create customer directory structure
mkdir -p "$BASE_DIR/$CUSTOMER_ID"
mkdir -p "$BASE_DIR/$CUSTOMER_ID/openclaw/workspace"

# Copy persona template into workspace
if [ -d "$TEMPLATE_DIR/$PERSONA" ]; then
    cp -r "$TEMPLATE_DIR/$PERSONA"/* "$BASE_DIR/$CUSTOMER_ID/openclaw/workspace/"
else
    echo "Error: Persona template '$PERSONA' not found"
    exit 1
fi

parse_onboarding_payload "$ONBOARDING_PAYLOAD_B64"

RESOLVED_NAME="$PREFERRED_NAME"
if [ -z "$RESOLVED_NAME" ]; then
    RESOLVED_NAME=$(fallback_name_from_email "$CUSTOMER_EMAIL")
fi
RESOLVED_NAME=$(sanitize_single_line "$RESOLVED_NAME")
if [ -z "$RESOLVED_NAME" ]; then
    RESOLVED_NAME="$CUSTOMER_EMAIL"
fi

DISPLAY_ROLE="$CUSTOMER_ROLE"
if [ -z "$DISPLAY_ROLE" ]; then
    DISPLAY_ROLE="Not provided"
fi

DISPLAY_COMMUNICATION_STYLE="$COMMUNICATION_STYLE"
if [ -z "$DISPLAY_COMMUNICATION_STYLE" ]; then
    DISPLAY_COMMUNICATION_STYLE="Not provided"
fi

DISPLAY_HELP_TOPICS=$(format_json_list_for_display "$HELP_TOPICS_JSON")
DISPLAY_TOP_PRIORITIES=$(format_json_list_for_display "$TOP_PRIORITIES_JSON")

# Update USER.md with customer info
USER_CONTEXT_FILE="$BASE_DIR/$CUSTOMER_ID/openclaw/workspace/USER.md"
if [ -f "$USER_CONTEXT_FILE" ]; then
    ESCAPED_CUSTOMER_NAME=$(escape_sed_replacement "$RESOLVED_NAME")
    ESCAPED_CUSTOMER_EMAIL=$(escape_sed_replacement "$CUSTOMER_EMAIL")

    sed -i "s/{{CUSTOMER_NAME}}/$ESCAPED_CUSTOMER_NAME/g" "$USER_CONTEXT_FILE"
    sed -i "s/{{CUSTOMER_EMAIL}}/$ESCAPED_CUSTOMER_EMAIL/g" "$USER_CONTEXT_FILE"
    upsert_onboarding_context_block \
        "$USER_CONTEXT_FILE" \
        "$DISPLAY_ROLE" \
        "$DISPLAY_HELP_TOPICS" \
        "$DISPLAY_COMMUNICATION_STYLE" \
        "$DISPLAY_TOP_PRIORITIES"
fi

# Set resource limits based on tier
case "$TIER" in
    standard)
        CPU_LIMIT="1"
        MEMORY_LIMIT="1G"
        NODE_HEAP_MB="768"
        ;;
    concierge)
        CPU_LIMIT="2"
        MEMORY_LIMIT="2G"
        NODE_HEAP_MB="1536"
        ;;
    *)
        CPU_LIMIT="1"
        MEMORY_LIMIT="1G"
        NODE_HEAP_MB="768"
        ;;
esac

# Resolve persona display name
case "$PERSONA" in
    personal-assistant) PERSONA_NAME="Personal Assistant" ;;
    chief-of-staff)     PERSONA_NAME="Chief of Staff" ;;
    sales-expert)       PERSONA_NAME="Sales Expert" ;;
    *)                  PERSONA_NAME="AI Assistant" ;;
esac

GATEWAY_TOKEN=$(generate_gateway_token)

# Generate OpenClaw config
cat > "$BASE_DIR/$CUSTOMER_ID/openclaw/openclaw.json" <<OCEOF
{
  "agents": {
    "defaults": {
      "model": {
        "primary": "openai/gpt-4o"
      }
    },
    "list": [
      {
        "id": "main",
        "identity": {
          "name": "$PERSONA_NAME",
          "theme": "helpful $PERSONA_NAME"
        }
      }
    ]
  },
  "env": {
    "OPENAI_API_KEY": "$OPENAI_API_KEY"
  },
  "session": {
    "dmScope": "per-channel-peer"
  },
  "gateway": {
    "mode": "local",
    "port": 18789,
    "bind": "lan",
    "auth": {
      "mode": "token",
      "token": "$GATEWAY_TOKEN"
    },
    "controlUi": {
      "enabled": true,
      "basePath": "/openclaw",
      "dangerouslyDisableDeviceAuth": true,
      "allowedOrigins": ["$APP_ORIGIN"]
    }
  },
  "channels": {
    "telegram": {
      "enabled": false
    }
  },
  "logging": {
    "level": "info"
  }
}
OCEOF

# Generate customer metadata
cat > "$BASE_DIR/$CUSTOMER_ID/config.json" <<EOF_META
{
  "customer_id": "$CUSTOMER_ID",
  "email": "$CUSTOMER_EMAIL",
  "persona": "$PERSONA",
  "tier": "$TIER",
  "messaging": [],
  "created_at": "$(date -Iseconds)"
}
EOF_META

persist_gateway_token "$GATEWAY_TOKEN"

# Generate docker-compose for this customer
cat > "$BASE_DIR/$CUSTOMER_ID/docker-compose.yml" <<EOF_COMPOSE
services:
  openclaw:
    image: $OPENCLAW_IMAGE
    container_name: clawsrus-${CUSTOMER_ID}
    working_dir: /home/node
    command: ["gateway", "run", "--allow-unconfigured"]
    volumes:
      - ./openclaw:/home/node/.openclaw
    environment:
      - NODE_ENV=production
      - HOME=/home/node
      - NODE_OPTIONS=--max-old-space-size=${NODE_HEAP_MB}
    cpus: '${CPU_LIMIT}'
    mem_limit: ${MEMORY_LIMIT}
    healthcheck:
      test: ["CMD", "curl", "-fsS", "http://127.0.0.1:${OPENCLAW_GATEWAY_PORT}/openclaw/"]
      interval: 20s
      timeout: 5s
      retries: 5
      start_period: 20s
    restart: unless-stopped
    networks:
      - $OPENCLAW_DOCKER_NETWORK

networks:
  $OPENCLAW_DOCKER_NETWORK:
    external: true
EOF_COMPOSE

# Start Docker container
cd "$BASE_DIR/$CUSTOMER_ID"
docker compose up -d

CONTAINER_NAME="clawsrus-${CUSTOMER_ID}"
if ! wait_for_gateway "$CONTAINER_NAME"; then
    echo "ERROR: Gateway did not become reachable within ${OPENCLAW_READY_TIMEOUT_SECONDS}s"
    docker logs --tail 120 "$CONTAINER_NAME" || true
    exit 1
fi

echo "Provisioned $CUSTOMER_ID with persona $PERSONA"
echo "  Workspace: $BASE_DIR/$CUSTOMER_ID/openclaw/workspace"
echo "  Config: $BASE_DIR/$CUSTOMER_ID/config.json"
echo "  Container: ${CONTAINER_NAME}"
