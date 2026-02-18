#!/bin/bash
# Usage: ./connect-telegram.sh <user-id> <telegram-bot-token> <bot-username>

set -e

USER_ID=$1
BOT_TOKEN=$2
BOT_USERNAME=$3

if [ -z "$USER_ID" ] || [ -z "$BOT_TOKEN" ] || [ -z "$BOT_USERNAME" ]; then
  echo "Usage: ./connect-telegram.sh <user-id> <telegram-bot-token> <bot-username>"
  exit 1
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

jq \
  --arg token "$BOT_TOKEN" \
  '.channels.telegram = {
      "enabled": true,
      "botToken": $token,
      "allowFrom": ["*"]
    }' \
  "$OPENCLAW_CONFIG" > "$TMP_OPENCLAW"

mv "$TMP_OPENCLAW" "$OPENCLAW_CONFIG"

if [ -f "$CUSTOMER_CONFIG" ]; then
  TMP_CUSTOMER=$(mktemp)
  jq '.messaging = ((.messaging // []) + ["telegram"] | unique)' "$CUSTOMER_CONFIG" > "$TMP_CUSTOMER"
  mv "$TMP_CUSTOMER" "$CUSTOMER_CONFIG"
fi

docker restart "$CONTAINER_NAME" >/dev/null

echo "Telegram connected for $USER_ID (@$BOT_USERNAME)"
