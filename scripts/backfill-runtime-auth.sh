#!/bin/bash
# One-time migration: normalize customer runtimes to token auth and stable compose.

set -euo pipefail

BASE_DIR="${BASE_DIR:-/opt/clawsrus/customers}"
APP_ORIGIN="${NEXT_PUBLIC_APP_URL:-https://app.clawsrus.com}"
OPENCLAW_IMAGE="${OPENCLAW_IMAGE:-clawsrus/openclaw-runtime:2026.2.17-r1}"
OPENCLAW_DOCKER_NETWORK="${OPENCLAW_DOCKER_NETWORK:-clawsrus-network}"
OPENCLAW_GATEWAY_PORT="${OPENCLAW_GATEWAY_PORT:-18789}"
OPENCLAW_READY_TIMEOUT_SECONDS="${OPENCLAW_READY_TIMEOUT_SECONDS:-90}"

log() {
  echo "[$(date -Iseconds)] $1"
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

normalize_existing_token() {
  local value="${1:-}"
  value="$(echo "$value" | xargs)"
  local lowered
  lowered="$(echo "$value" | tr '[:upper:]' '[:lower:]')"

  if [ -z "$value" ] || [ "$lowered" = "null" ] || [ "$lowered" = "undefined" ]; then
    echo ""
    return
  fi

  echo "$value"
}

persist_gateway_token() {
  local user_id=$1
  local token=$2

  if [ -z "${SUPABASE_URL:-}" ] || [ -z "${SUPABASE_SERVICE_KEY:-}" ]; then
    log "Skipping Supabase sync for $user_id (missing SUPABASE_URL/SUPABASE_SERVICE_KEY)"
    return 0
  fi

  local response_file
  response_file=$(mktemp)
  local payload
  payload=$(jq -nc --arg gateway_token "$token" --arg updated_at "$(date -Iseconds)" \
    '{gateway_token: $gateway_token, updated_at: $updated_at}')

  local status_code
  status_code=$(curl -sS -o "$response_file" -w "%{http_code}" \
    -X PATCH "$SUPABASE_URL/rest/v1/users?id=eq.${user_id}" \
    -H "apikey: $SUPABASE_SERVICE_KEY" \
    -H "Authorization: Bearer $SUPABASE_SERVICE_KEY" \
    -H "Content-Type: application/json" \
    -d "$payload")

  if [[ "$status_code" =~ ^2 ]]; then
    log "Supabase gateway token synced for $user_id"
    rm -f "$response_file"
    return 0
  fi

  if grep -Eq '"code":"42703"|"code":"PGRST204"|gateway_token' "$response_file"; then
    log "Supabase users.gateway_token column missing; skipping token sync for $user_id"
    rm -f "$response_file"
    return 0
  fi

  log "WARNING: Supabase token sync failed for $user_id (HTTP $status_code)"
  cat "$response_file" || true
  rm -f "$response_file"
  return 0
}

resolve_tier_resources() {
  local tier=$1
  case "$tier" in
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
    if [ "$status_code" = "200" ]; then
      log "Gateway healthy for $container_name (${container_ip}:${OPENCLAW_GATEWAY_PORT})"
      return 0
    fi

    sleep 2
  done

  return 1
}

patch_openclaw_config() {
  local config_file=$1
  local gateway_token=$2

  local tmp_file
  tmp_file=$(mktemp)

  jq --arg token "$gateway_token" --arg origin "$APP_ORIGIN" '
    .gateway = ((.gateway // {}) + {
      "mode": "local",
      "port": ((.gateway.port // 18789) | tonumber? // 18789),
      "bind": "lan",
      "auth": {
        "mode": "token",
        "token": $token
      }
    }) |
    .gateway.controlUi = ((.gateway.controlUi // {}) + {
      "enabled": true,
      "basePath": (.gateway.controlUi.basePath // "/openclaw"),
      "dangerouslyDisableDeviceAuth": true,
      "allowedOrigins": [$origin]
    }) |
    .channels = (.channels // {}) |
    .channels.telegram = ((.channels.telegram // {}) |
      if ((.botToken // "" | tostring | ascii_downcase) as $bt | ($bt == "" or $bt == "null" or $bt == "undefined")) then
        .enabled = false | del(.botToken)
      else
        .
      end)
  ' "$config_file" > "$tmp_file"

  mv "$tmp_file" "$config_file"
}

write_normalized_compose() {
  local compose_file=$1

  cat > "$compose_file" <<COMPOSE
services:
  openclaw:
    image: ${OPENCLAW_IMAGE}
    container_name: clawsrus-${USER_ID}
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
      - ${OPENCLAW_DOCKER_NETWORK}

networks:
  ${OPENCLAW_DOCKER_NETWORK}:
    external: true
COMPOSE
}

shopt -s nullglob
CUSTOMER_DIRS=("$BASE_DIR"/user-*)

if [ ${#CUSTOMER_DIRS[@]} -eq 0 ]; then
  log "No customer directories found under $BASE_DIR"
  exit 0
fi

SUCCESS_COUNT=0
FAIL_COUNT=0

for customer_dir in "${CUSTOMER_DIRS[@]}"; do
  USER_ID="$(basename "$customer_dir")"
  OPENCLAW_CONFIG="$customer_dir/openclaw/openclaw.json"
  CUSTOMER_CONFIG="$customer_dir/config.json"
  COMPOSE_FILE="$customer_dir/docker-compose.yml"
  CONTAINER_NAME="clawsrus-${USER_ID}"

  if [ ! -f "$OPENCLAW_CONFIG" ]; then
    log "Skipping $USER_ID (missing $OPENCLAW_CONFIG)"
    continue
  fi

  log "Backfilling runtime config for $USER_ID"

  EXISTING_TOKEN_RAW=$(jq -r '.gateway.auth.token // empty' "$OPENCLAW_CONFIG" 2>/dev/null || true)
  GATEWAY_TOKEN="$(normalize_existing_token "$EXISTING_TOKEN_RAW")"
  if [ -z "$GATEWAY_TOKEN" ]; then
    GATEWAY_TOKEN="$(generate_gateway_token)"
  fi

  patch_openclaw_config "$OPENCLAW_CONFIG" "$GATEWAY_TOKEN"

  USER_TIER="standard"
  if [ -f "$CUSTOMER_CONFIG" ]; then
    USER_TIER=$(jq -r '.tier // "standard"' "$CUSTOMER_CONFIG" 2>/dev/null || echo "standard")
  fi
  resolve_tier_resources "$USER_TIER"
  write_normalized_compose "$COMPOSE_FILE"

  (
    cd "$customer_dir"
    docker compose up -d --force-recreate
  )

  persist_gateway_token "$USER_ID" "$GATEWAY_TOKEN"

  if wait_for_gateway "$CONTAINER_NAME"; then
    SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
  else
    log "ERROR: Gateway did not become healthy for $USER_ID"
    docker logs --tail 120 "$CONTAINER_NAME" || true
    FAIL_COUNT=$((FAIL_COUNT + 1))
  fi
done

log "Backfill complete: success=${SUCCESS_COUNT}, failed=${FAIL_COUNT}"

if [ "$FAIL_COUNT" -gt 0 ]; then
  exit 1
fi
