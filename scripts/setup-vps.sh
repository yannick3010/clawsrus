#!/bin/bash
# ClawsRUs — One-Time VPS Setup Script
# Run this on a fresh Hetzner CPX21 (Ubuntu 22.04+)
# Usage: sudo bash setup-vps.sh

set -e

echo "=== ClawsRUs VPS Setup ==="

# Update system
apt-get update && apt-get upgrade -y

# Install Docker
if ! command -v docker &> /dev/null; then
    echo "Installing Docker..."
    curl -fsSL https://get.docker.com | sh
    systemctl enable docker
    systemctl start docker
else
    echo "Docker already installed"
fi

# Install jq (needed by poller)
apt-get install -y jq

# Create service user
if ! id "clawsrus" &>/dev/null; then
    useradd -r -s /bin/false clawsrus
    usermod -aG docker clawsrus
fi

# Create directory structure
mkdir -p /opt/clawsrus/{templates,customers,scripts}
mkdir -p /var/log/clawsrus

# Create Docker network
docker network create clawsrus-network 2>/dev/null || true

# Copy templates (assumes this script is run from the repo root)
if [ -d "./templates" ]; then
    cp -r ./templates/* /opt/clawsrus/templates/
    echo "Templates copied"
fi

# Copy scripts
if [ -d "./scripts" ]; then
    cp ./scripts/provision-user.sh /opt/clawsrus/scripts/
    cp ./scripts/poll-and-provision.sh /opt/clawsrus/scripts/
    chmod +x /opt/clawsrus/scripts/*.sh
    echo "Scripts copied"
fi

# Set permissions
chown -R clawsrus:clawsrus /opt/clawsrus
chown -R clawsrus:clawsrus /var/log/clawsrus

# Create environment file for the poller (fill in values manually)
cat > /opt/clawsrus/.env <<'EOF'
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=eyxxx
RESEND_API_KEY=re_xxx
OPENAI_API_KEY=sk-xxx
EOF
chmod 600 /opt/clawsrus/.env

# Create systemd service for poller
cat > /etc/systemd/system/clawsrus-poller.service <<'EOF'
[Unit]
Description=ClawsRUs Provisioning Poller
After=docker.service
Requires=docker.service

[Service]
Type=simple
User=clawsrus
EnvironmentFile=/opt/clawsrus/.env
ExecStart=/opt/clawsrus/scripts/poll-and-provision.sh
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable clawsrus-poller

# Configure firewall
ufw allow OpenSSH
ufw --force enable
echo "Firewall configured (SSH only — Docker manages container ports)"

echo ""
echo "=== Setup Complete ==="
echo ""
echo "Next steps:"
echo "  1. Edit /opt/clawsrus/.env with your Supabase + Resend keys"
echo "  2. Start the poller: systemctl start clawsrus-poller"
echo "  3. Monitor logs: journalctl -u clawsrus-poller -f"
echo "  4. Or: tail -f /var/log/clawsrus/poller.log"
