#!/bin/bash
# ClawsRUs — User Provisioning Script
# Usage: ./provision-user.sh <customer-id> <email> <persona> <tier> <telegram-token>
# Note: OPENAI_API_KEY is read from the environment (set in /opt/clawsrus/.env)

set -e

CUSTOMER_ID=$1
CUSTOMER_EMAIL=$2
PERSONA=$3
TIER=$4
TELEGRAM_BOT_TOKEN=$5

if [ -z "$CUSTOMER_ID" ] || [ -z "$CUSTOMER_EMAIL" ] || [ -z "$PERSONA" ] || [ -z "$TIER" ] || [ -z "$TELEGRAM_BOT_TOKEN" ]; then
    echo "Usage: ./provision-user.sh <customer-id> <email> <persona> <tier> <telegram-token>"
    echo "Example: ./provision-user.sh user-123 john@example.com personal-assistant standard 123:ABC"
    exit 1
fi

if [ -z "$OPENAI_API_KEY" ]; then
    echo "Error: OPENAI_API_KEY environment variable is not set"
    exit 1
fi

BASE_DIR="/opt/clawsrus/customers"
TEMPLATE_DIR="/opt/clawsrus/templates"

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
        ;;
    concierge)
        CPU_LIMIT="2"
        MEMORY_LIMIT="2G"
        ;;
    *)
        CPU_LIMIT="1"
        MEMORY_LIMIT="1G"
        ;;
esac

# Resolve persona display name
case "$PERSONA" in
    personal-assistant) PERSONA_NAME="Personal Assistant" ;;
    chief-of-staff)     PERSONA_NAME="Chief of Staff" ;;
    sales-expert)       PERSONA_NAME="Sales Expert" ;;
    *)                  PERSONA_NAME="AI Assistant" ;;
esac

# Generate OpenClaw config (current schema)
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
    "bind": "loopback"
  },
  "channels": {
    "telegram": {
      "enabled": true,
      "botToken": "$TELEGRAM_BOT_TOKEN",
      "allowFrom": ["*"]
    }
  },
  "logging": {
    "level": "info"
  }
}
OCEOF

# Generate customer metadata
cat > "$BASE_DIR/$CUSTOMER_ID/config.json" <<EOF
{
  "customer_id": "$CUSTOMER_ID",
  "email": "$CUSTOMER_EMAIL",
  "persona": "$PERSONA",
  "tier": "$TIER",
  "messaging": ["telegram"],
  "created_at": "$(date -Iseconds)"
}
EOF

# Generate docker-compose for this customer
cat > "$BASE_DIR/$CUSTOMER_ID/docker-compose.yml" <<EOF
services:
  openclaw:
    image: node:22-bookworm
    container_name: clawsrus-${CUSTOMER_ID}
    working_dir: /home/node
    command: >
      sh -c "npm install -g openclaw &&
             openclaw gateway run --allow-unconfigured"
    volumes:
      - ./openclaw:/home/node/.openclaw
    environment:
      - NODE_ENV=production
      - HOME=/home/node
    deploy:
      resources:
        limits:
          cpus: '${CPU_LIMIT}'
          memory: ${MEMORY_LIMIT}
    restart: unless-stopped
    networks:
      - clawsrus-network

networks:
  clawsrus-network:
    external: true
EOF

# Start Docker container
cd "$BASE_DIR/$CUSTOMER_ID"
docker compose up -d

echo "Provisioned $CUSTOMER_ID with persona $PERSONA"
echo "  Workspace: $BASE_DIR/$CUSTOMER_ID/openclaw/workspace"
echo "  Config: $BASE_DIR/$CUSTOMER_ID/config.json"
echo "  Container: clawsrus-${CUSTOMER_ID}"
