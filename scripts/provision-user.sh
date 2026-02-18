#!/bin/bash
# ClawsRUs — User Provisioning Script
# Usage: ./provision-user.sh <customer-id> <email> <persona> <tier>
# Note: OPENAI_API_KEY is read from the environment (set in /opt/clawsrus/.env)

set -euo pipefail

CUSTOMER_ID=$1
CUSTOMER_EMAIL=$2
PERSONA=$3
TIER=$4

if [ -z "$CUSTOMER_ID" ] || [ -z "$CUSTOMER_EMAIL" ] || [ -z "$PERSONA" ] || [ -z "$TIER" ]; then
    echo "Usage: ./provision-user.sh <customer-id> <email> <persona> <tier>"
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
OPENCLAW_IMAGE="${OPENCLAW_IMAGE:-clawsrus/openclaw-runtime:2026.02.18}"
OPENCLAW_GATEWAY_PORT="${OPENCLAW_GATEWAY_PORT:-18789}"
OPENCLAW_READY_TIMEOUT_SECONDS="${OPENCLAW_READY_TIMEOUT_SECONDS:-90}"

TRUSTED_PROXY_IPS="${OPENCLAW_TRUSTED_PROXIES:-127.0.0.1,172.17.0.1}"
IFS=',' read -ra IPS <<< "$TRUSTED_PROXY_IPS"
TRUSTED_PROXIES_JSON=""
for raw_ip in "${IPS[@]}"; do
    ip=$(echo "$raw_ip" | xargs)
    if [ -n "$ip" ]; then
        if [ -n "$TRUSTED_PROXIES_JSON" ]; then
            TRUSTED_PROXIES_JSON+=" ,"
        fi
        TRUSTED_PROXIES_JSON+="\"$ip\""
    fi
done
TRUSTED_PROXIES_JSON="[$TRUSTED_PROXIES_JSON]"

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

# Update USER.md with customer info
if [ -f "$BASE_DIR/$CUSTOMER_ID/openclaw/workspace/USER.md" ]; then
    sed -i "s/{{CUSTOMER_NAME}}/$CUSTOMER_EMAIL/g" "$BASE_DIR/$CUSTOMER_ID/openclaw/workspace/USER.md"
    sed -i "s/{{CUSTOMER_EMAIL}}/$CUSTOMER_EMAIL/g" "$BASE_DIR/$CUSTOMER_ID/openclaw/workspace/USER.md"
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
    "trustedProxies": $TRUSTED_PROXIES_JSON,
    "auth": {
      "mode": "trusted-proxy",
      "trustedProxy": {
        "userHeader": "x-forwarded-user",
        "requiredHeaders": ["x-forwarded-proto", "x-forwarded-host"],
        "allowUsers": ["$CUSTOMER_EMAIL"]
      }
    },
    "controlUi": {
      "enabled": true,
      "basePath": "/openclaw",
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
    restart: unless-stopped
    networks:
      - clawsrus-network

networks:
  clawsrus-network:
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
