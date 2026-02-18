#!/bin/bash
# ClawsRUs — VPS Poller Script
# Checks Supabase for users with status=pending_provision every 30s
# Runs as a systemd service on the VPS

set -euo pipefail

SUPABASE_URL="${SUPABASE_URL}"
SUPABASE_SERVICE_KEY="${SUPABASE_SERVICE_KEY}"
RESEND_API_KEY="${RESEND_API_KEY}"
NEXT_PUBLIC_APP_URL="${NEXT_PUBLIC_APP_URL:-https://app.clawsrus.com}"
SCRIPT_DIR="/opt/clawsrus/scripts"
LOG_FILE="/var/log/clawsrus/poller.log"

log() {
    echo "[$(date -Iseconds)] $1" | tee -a "$LOG_FILE"
}

send_welcome_email() {
    local EMAIL=$1
    local PERSONA_NAME=$2

    curl -s -X POST "https://api.resend.com/emails" \
        -H "Authorization: Bearer $RESEND_API_KEY" \
        -H "Content-Type: application/json" \
        -d "{
            \"from\": \"ClawsRUs <hello@clawsrus.com>\",
            \"to\": \"$EMAIL\",
            \"subject\": \"Your $PERSONA_NAME AI is ready!\",
            \"html\": \"<h1>Your $PERSONA_NAME is live!</h1><p>Your dedicated assistant has been provisioned successfully.</p><p>Return to your setup flow and you will be redirected into your dashboard automatically.</p><p>Dashboard: <a href='$NEXT_PUBLIC_APP_URL/login'>$NEXT_PUBLIC_APP_URL/login</a></p>\"
        }"
}

log_to_supabase() {
    local USER_ID=$1
    local EVENT=$2
    local DETAILS=$3

    curl -s -X POST "$SUPABASE_URL/rest/v1/provisioning_log" \
        -H "apikey: $SUPABASE_SERVICE_KEY" \
        -H "Authorization: Bearer $SUPABASE_SERVICE_KEY" \
        -H "Content-Type: application/json" \
        -d "{\"user_id\": \"$USER_ID\", \"event\": \"$EVENT\", \"details\": $DETAILS}"
}

update_user_status() {
    local USER_ID=$1
    local STATUS=$2
    local CONTAINER_ID=${3:-""}

    local BODY="{\"status\": \"$STATUS\", \"updated_at\": \"$(date -Iseconds)\"}"
    if [ -n "$CONTAINER_ID" ]; then
        BODY="{\"status\": \"$STATUS\", \"container_id\": \"$CONTAINER_ID\", \"updated_at\": \"$(date -Iseconds)\"}"
    fi

    curl -s -X PATCH "$SUPABASE_URL/rest/v1/users?id=eq.$USER_ID" \
        -H "apikey: $SUPABASE_SERVICE_KEY" \
        -H "Authorization: Bearer $SUPABASE_SERVICE_KEY" \
        -H "Content-Type: application/json" \
        -d "$BODY"
}

provision_user() {
    local ROW=$1

    local USER_ID=$(echo "$ROW" | jq -r '.id')
    local EMAIL=$(echo "$ROW" | jq -r '.email')
    local PERSONA=$(echo "$ROW" | jq -r '.persona')
    local TIER=$(echo "$ROW" | jq -r '.tier')

    local PERSONA_NAME
    case "$PERSONA" in
        chief-of-staff) PERSONA_NAME="Chief of Staff" ;;
        sales-expert) PERSONA_NAME="Sales Expert" ;;
        personal-assistant) PERSONA_NAME="Personal Assistant" ;;
        *) PERSONA_NAME="$PERSONA" ;;
    esac

    log "Provisioning $USER_ID ($EMAIL, $PERSONA, $TIER)..."
    log_to_supabase "$USER_ID" "provisioning_started" "{\"persona\": \"$PERSONA\", \"tier\": \"$TIER\"}"

    update_user_status "$USER_ID" "provisioning"

    if "$SCRIPT_DIR/provision-user.sh" "$USER_ID" "$EMAIL" "$PERSONA" "$TIER" 2>&1 | tee -a "$LOG_FILE"; then
        local CONTAINER_NAME="clawsrus-${USER_ID}"
        if docker ps --format '{{.Names}}' | grep -qx "$CONTAINER_NAME"; then
            update_user_status "$USER_ID" "active" "$CONTAINER_NAME"
            log_to_supabase "$USER_ID" "provisioning_complete" "{\"container\": \"$CONTAINER_NAME\"}"

            send_welcome_email "$EMAIL" "$PERSONA_NAME"
            log "Provisioned $USER_ID and sent welcome email"
        else
            update_user_status "$USER_ID" "provision_failed"
            log_to_supabase "$USER_ID" "provisioning_failed" "{\"error\": \"container not running after provision\"}"
            log "ERROR: Provision script returned success but container not running for $USER_ID"
        fi
    else
        update_user_status "$USER_ID" "provision_failed"
        log_to_supabase "$USER_ID" "provisioning_failed" "{\"error\": \"provision script exited non-zero\"}"
        log "ERROR: Failed to provision $USER_ID"

        curl -s -X POST "https://api.resend.com/emails" \
            -H "Authorization: Bearer $RESEND_API_KEY" \
            -H "Content-Type: application/json" \
            -d "{
                \"from\": \"ClawsRUs Alerts <alerts@clawsrus.com>\",
                \"to\": \"yaya@gizmo.com\",
                \"subject\": \"[ALERT] Provisioning failed for $USER_ID\",
                \"html\": \"<p>User: $EMAIL</p><p>Persona: $PERSONA</p><p>Check logs at $LOG_FILE</p>\"
            }"
    fi
}

log "ClawsRUs poller started"

while true; do
    RESPONSE=$(curl -s "$SUPABASE_URL/rest/v1/users?status=eq.pending_provision&select=*" \
        -H "apikey: $SUPABASE_SERVICE_KEY" \
        -H "Authorization: Bearer $SUPABASE_SERVICE_KEY")

    COUNT=$(echo "$RESPONSE" | jq '. | length')

    if [ "$COUNT" -gt 0 ]; then
        log "Found $COUNT users to provision"
        echo "$RESPONSE" | jq -c '.[]' | while read -r ROW; do
            provision_user "$ROW"
        done
    fi

    sleep 30
done
