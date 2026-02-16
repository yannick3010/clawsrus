#!/bin/bash
# ClawsRUs — User Provisioning Script
# Usage: ./provision-user.sh <customer-id> <email> <persona> <tier> <telegram-token> <ai-provider> <ai-api-key>

set -e

CUSTOMER_ID=$1
CUSTOMER_EMAIL=$2
PERSONA=$3
TIER=$4
TELEGRAM_BOT_TOKEN=$5
AI_PROVIDER=$6
AI_API_KEY=$7

if [ -z "$CUSTOMER_ID" ] || [ -z "$CUSTOMER_EMAIL" ] || [ -z "$PERSONA" ] || [ -z "$TIER" ] || [ -z "$TELEGRAM_BOT_TOKEN" ] || [ -z "$AI_PROVIDER" ] || [ -z "$AI_API_KEY" ]; then
    echo "Usage: ./provision-user.sh <customer-id> <email> <persona> <tier> <telegram-token> <ai-provider> <ai-api-key>"
    echo "Example: ./provision-user.sh user-123 john@example.com chief-of-staff pro 123:ABC openai sk-xxx"
    exit 1
fi

BASE_DIR="/opt/clawsrus/customers"
TEMPLATE_DIR="/opt/clawsrus/templates"

echo "Provisioning $CUSTOMER_ID ($PERSONA, $TIER)..."

# Create customer directory
mkdir -p "$BASE_DIR/$CUSTOMER_ID"
mkdir -p "$BASE_DIR/$CUSTOMER_ID/data"

# Copy persona template
if [ -d "$TEMPLATE_DIR/$PERSONA" ]; then
    cp -r "$TEMPLATE_DIR/$PERSONA" "$BASE_DIR/$CUSTOMER_ID/workspace"
else
    echo "Error: Persona template '$PERSONA' not found"
    exit 1
fi

# Update USER.md with customer info
if [ -f "$BASE_DIR/$CUSTOMER_ID/workspace/USER.md" ]; then
    sed -i "s/{{CUSTOMER_NAME}}/$CUSTOMER_EMAIL/g" "$BASE_DIR/$CUSTOMER_ID/workspace/USER.md"
    sed -i "s/{{CUSTOMER_EMAIL}}/$CUSTOMER_EMAIL/g" "$BASE_DIR/$CUSTOMER_ID/workspace/USER.md"
fi

# Set resource limits based on tier
case "$TIER" in
    starter)
        CPU_LIMIT="0.5"
        MEMORY_LIMIT="512M"
        ;;
    pro)
        CPU_LIMIT="1"
        MEMORY_LIMIT="1G"
        ;;
    agency)
        CPU_LIMIT="2"
        MEMORY_LIMIT="2G"
        ;;
    *)
        CPU_LIMIT="0.5"
        MEMORY_LIMIT="512M"
        ;;
esac

# Generate config
cat > "$BASE_DIR/$CUSTOMER_ID/config.json" <<EOF
{
  "customer_id": "$CUSTOMER_ID",
  "email": "$CUSTOMER_EMAIL",
  "persona": "$PERSONA",
  "tier": "$TIER",
  "ai_provider": "$AI_PROVIDER",
  "messaging": ["telegram"],
  "created_at": "$(date -Iseconds)"
}
EOF

# Generate docker-compose for this customer
cat > "$BASE_DIR/$CUSTOMER_ID/docker-compose.yml" <<EOF
version: '3.8'

services:
  openclaw:
    image: node:22-slim
    container_name: clawsrus-${CUSTOMER_ID}
    working_dir: /home/app
    command: >
      sh -c "npm install -g openclaw &&
             openclaw start --telegram --workspace /home/app/workspace"
    volumes:
      - ./workspace:/home/app/workspace
      - ./data:/home/app/.openclaw
    environment:
      - CUSTOMER_ID=${CUSTOMER_ID}
      - PERSONA=${PERSONA}
      - TELEGRAM_BOT_TOKEN=${TELEGRAM_BOT_TOKEN}
      - AI_PROVIDER=${AI_PROVIDER}
      - OPENAI_API_KEY=$([ "$AI_PROVIDER" = "openai" ] && echo "$AI_API_KEY" || echo "")
      - GOOGLE_AI_API_KEY=$([ "$AI_PROVIDER" = "gemini" ] && echo "$AI_API_KEY" || echo "")
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
echo "  Workspace: $BASE_DIR/$CUSTOMER_ID/workspace"
echo "  Config: $BASE_DIR/$CUSTOMER_ID/config.json"
echo "  Container: clawsrus-${CUSTOMER_ID}"
