#!/bin/bash
# Usage:
#   ./connect-telegram.sh <user-id> <telegram-bot-token> <bot-username>
#   ./connect-telegram.sh <user-id> --disconnect

set -euo pipefail

USER_ID="${1:-}"
ACTION="connect"
BOT_TOKEN="${2:-}"
BOT_USERNAME="${3:-}"

if [ -z "$USER_ID" ]; then
  echo "Usage: ./connect-telegram.sh <user-id> <telegram-bot-token> <bot-username>"
  echo "   or: ./connect-telegram.sh <user-id> --disconnect"
  exit 1
fi

if [ "${BOT_TOKEN:-}" = "--disconnect" ]; then
  ACTION="disconnect"
else
  if [ -z "$BOT_TOKEN" ] || [ -z "$BOT_USERNAME" ]; then
    echo "Usage: ./connect-telegram.sh <user-id> <telegram-bot-token> <bot-username>"
    echo "   or: ./connect-telegram.sh <user-id> --disconnect"
    exit 1
  fi

  BOT_TOKEN_TRIMMED="$(echo "$BOT_TOKEN" | xargs)"
  BOT_TOKEN_LOWER="$(echo "$BOT_TOKEN_TRIMMED" | tr '[:upper:]' '[:lower:]')"
  if [ -z "$BOT_TOKEN_TRIMMED" ] || [ "$BOT_TOKEN_LOWER" = "null" ] || [ "$BOT_TOKEN_LOWER" = "undefined" ]; then
    echo "Invalid telegram bot token"
    exit 1
  fi
  BOT_TOKEN="$BOT_TOKEN_TRIMMED"
fi

BASE_DIR="/opt/clawsrus/customers/$USER_ID"
OPENCLAW_CONFIG="$BASE_DIR/openclaw/openclaw.json"
CUSTOMER_CONFIG="$BASE_DIR/config.json"
CONTAINER_NAME="clawsrus-${USER_ID}"

if [ ! -f "$OPENCLAW_CONFIG" ]; then
  echo "OpenClaw config not found: $OPENCLAW_CONFIG"
  exit 1
fi

TMP_OPENCLAW=$(mktemp)

if [ "$ACTION" = "disconnect" ]; then
  jq \
    '.channels = (.channels // {}) |
     .channels.telegram = ((.channels.telegram // {}) | .enabled = false | del(.botToken) | del(.allowFrom))' \
    "$OPENCLAW_CONFIG" > "$TMP_OPENCLAW"
else
  jq \
    --arg token "$BOT_TOKEN" \
    '.channels = (.channels // {}) |
     .channels.telegram = {
       "enabled": true,
       "botToken": $token,
       "allowFrom": ["*"]
     }' \
    "$OPENCLAW_CONFIG" > "$TMP_OPENCLAW"
fi

mv "$TMP_OPENCLAW" "$OPENCLAW_CONFIG"

if [ -f "$CUSTOMER_CONFIG" ]; then
  TMP_CUSTOMER=$(mktemp)
  if [ "$ACTION" = "disconnect" ]; then
    jq '.messaging = ((.messaging // []) | map(select(. != "telegram")))' "$CUSTOMER_CONFIG" > "$TMP_CUSTOMER"
  else
    jq '.messaging = ((.messaging // []) + ["telegram"] | unique)' "$CUSTOMER_CONFIG" > "$TMP_CUSTOMER"
  fi
  mv "$TMP_CUSTOMER" "$CUSTOMER_CONFIG"
fi

docker restart "$CONTAINER_NAME" >/dev/null

if [ "$ACTION" = "disconnect" ]; then
  echo "Telegram disconnected for $USER_ID"
else
  echo "Telegram connected for $USER_ID (@$BOT_USERNAME)"
fi
