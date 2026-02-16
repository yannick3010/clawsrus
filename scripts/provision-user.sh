#!/bin/bash
# ClawsRUs — User Provisioning Script
# Usage: ./provision-user.sh <customer-id> <email> <persona> <tier>

set -e

CUSTOMER_ID=$1
CUSTOMER_EMAIL=$2
PERSONA=$3
TIER=$4

if [ -z "$CUSTOMER_ID" ] || [ -z "$CUSTOMER_EMAIL" ] || [ -z "$PERSONA" ] || [ -z "$TIER" ]; then
    echo "Usage: ./provision-user.sh <customer-id> <email> <persona> <tier>"
    echo "Example: ./provision-user.sh user-123 john@example.com chief-of-staff pro"
    exit 1
fi

BASE_DIR="/opt/clawsrus/customers"
TEMPLATE_DIR="/opt/clawsrus/templates"

echo "Provisioning $CUSTOMER_ID ($PERSONA, $TIER)..."

# Create customer directory
mkdir -p "$BASE_DIR/$CUSTOMER_ID"

# Copy persona template
if [ -d "$TEMPLATE_DIR/$PERSONA" ]; then
    cp -r "$TEMPLATE_DIR/$PERSONA" "$BASE_DIR/$CUSTOMER_ID/workspace"
else
    echo "Error: Persona template '$PERSONA' not found"
    exit 1
fi

# Generate config
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

# Update USER.md with customer info
if [ -f "$BASE_DIR/$CUSTOMER_ID/workspace/USER.md" ]; then
    sed -i "s/{{CUSTOMER_NAME}}/$CUSTOMER_EMAIL/g" "$BASE_DIR/$CUSTOMER_ID/workspace/USER.md"
    sed -i "s/{{CUSTOMER_EMAIL}}/$CUSTOMER_EMAIL/g" "$BASE_DIR/$CUSTOMER_ID/workspace/USER.md"
fi

# Start Docker container (when auto-provisioning is ready)
# docker-compose -f "$BASE_DIR/docker-compose.customer.yml" up -d $CUSTOMER_ID

echo "✓ Provisioned $CUSTOMER_ID with persona $PERSONA"
echo "  Workspace: $BASE_DIR/$CUSTOMER_ID/workspace"
echo "  Config: $BASE_DIR/$CUSTOMER_ID/config.json"
