# ClawsRUs — Technical Setup

## Overview

Each customer gets their own isolated OpenClaw instance running in a Docker container. This document covers the architecture, provisioning flow, and operational procedures.

---

## Architecture

```
                    ┌─────────────────┐
                    │   Stripe        │
                    │   (payments)    │
                    └────────┬────────┘
                             │ webhook
                             ▼
┌──────────────┐    ┌─────────────────┐    ┌──────────────────┐
│  User signs  │───▶│  Provisioning   │───▶│  Docker Host     │
│  up on web   │    │  API            │    │  (Hetzner/DO)   │
└──────────────┘    └─────────────────┘    └────────┬─────────┘
                                                  │
                             ┌────────────────────┴────┐
                             ▼                         ▼
                    ┌────────────────┐        ┌────────────────┐
                    │ Container A    │        │ Container B    │
                    │ (Customer 1)   │        │ (Customer 2)   │
                    │ OpenClaw       │        │ OpenClaw       │
                    │ + Persona      │        │ + Persona      │
                    └────────────────┘        └────────────────┘
```

### Components

| Component | Technology | Purpose |
|-----------|------------|---------|
| Web App | Next.js / Static | Landing page, signup, dashboard |
| Provisioning API | Node.js | Spin up containers, manage users |
| Database | Supabase (PostgreSQL) | User data, subscriptions, configs |
| Runtime | OpenClaw | Per-customer AI agent instance |
| Container Orchestration | Docker + docker-compose | Isolated customer environments |
| Hosting | Hetzner or DigitalOcean | Compute (ARM64 recommended) |

---

## Docker Strategy

### Per-Customer Container

Each customer gets:
- Dedicated Docker container
- Isolated network namespace
- Resource limits (CPU/memory caps)
- Volume for workspace persistence
- Unique subdomain or path routing

### Image

```dockerfile
#基础镜像
FROM node:22-slim

# Install OpenClaw
RUN npm install -g openclaw

#预配置
WORKDIR /home/app
COPY provisioning/entrypoint.sh .
RUN chmod +x entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
```

### Resource Limits

| Tier | CPU | Memory | Disk |
|------|-----|--------|------|
| Starter | 0.5 core | 512MB | 5GB |
| Pro | 1 core | 1GB | 10GB |
| Agency | 2 cores | 2GB | 20GB |

---

## Provisioning Flow

### Manual (MVP)

1. User fills signup form → email sent to team
2. Gizmo reviews signup → manually provisions
3. Run provisioning script → creates container
4. Email credentials to user → they're live

### Automated (Phase 2)

```
User Signup
    │
    ▼
Stripe Checkout ──▶ Success Webhook
    │                      │
    │                  Provisioning API
    │                      │
    │                  Create Docker Container
    │                      │
    │                  Load Persona Template
    │                      │
    │                  Configure Messaging (Telegram/Discord)
    │                      │
    ▼                  Send Welcome Email
Failed              ──▶ User receives credentials
```

---

## Provisioning Script

### `scripts/provision-user.sh`

```bash
#!/bin/bash
set -e

CUSTOMER_ID=$1
CUSTOMER_EMAIL=$2
PERSONA=$3
TIER=$4

# Create customer workspace
mkdir -p /opt/clawsrus/customers/$CUSTOMER_ID

# Copy persona template
cp -r /opt/clawsrus/templates/$PERSONA /opt/clawsrus/customers/$CUSTOMER_ID/workspace

# Generate config
cat > /opt/clawsrus/customers/$CUSTOMER_ID/config.json <<EOF
{
  "customer_id": "$CUSTOMER_ID",
  "persona": "$PERSONA",
  "tier": "$TIER",
  "messaging": ["telegram"]
}
EOF

# Start container
docker-compose -f /opt/clawsrus/docker-compose.customer.yml up -d $CUSTOMER_ID

echo "Provisioned $CUSTOMER_ID with persona $PERSONA"
```

---

## Persona Templates

### Structure

```
templates/
├── chief-of-staff/
│   ├── SOUL.md
│   ├── USER.md
│   ├── AGENTS.md
│   ├── TOOLS.md
│   └── skills/
│       ├── calendar/
│       ├── email/
│       └── research/
├── sales-expert/
│   └── ...
└── personal-assistant/
    └── ...
```

### Template Variables

During provisioning, these get replaced:
- `{{CUSTOMER_NAME}}` → User's name
- `{{CUSTOMER_EMAIL}}` → User's email
- `{{CUSTOMER_ORG}}` → User's company (if provided)
- `{{CUSTOMER_TZ}}` → User's timezone
- Signup context from onboarding (`role`, `help_topics`, `communication_style`, `top_priorities`) is auto-injected into `USER.md` at container creation.

---

## Skill Packs

| Skill Pack | One-Time Price | What's Included |
|------------|----------------|-----------------|
| Email Mastery | $29 | Email drafting, threading, follow-ups |
| Research Pro | $49 | Web research, summarization, competitive intel |
| Calendar Pro | $19 | Meeting scheduling, availability management |
| Content Writer | $39 | Blog posts, social media, newsletters |
| Data Analyst | $59 | Spreadsheets, dashboards, reporting |

Skills are mounted into the container at provisioning time based on the customer's tier and purchases.

---

## Messaging Integration

### Telegram (Default)
- Bot created per-customer or shared pool
- User starts chat → authenticated via unique token
- Persona responds in Telegram

### Discord (Phase 2)
- Bot invited to user's server
- Role-based access control
- Persona as bot user

### Slack (Phase 2)
- Slack app installation
- DM or channel-based interaction

---

## Database Schema (Supabase)

### users
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| email | text | User email |
| name | text | Display name |
| tier | text | starter/pro/agency |
| status | text | active/suspended/cancelled |
| created_at | timestamp | Signup date |

### subscriptions
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | FK to users |
| stripe_customer_id | text | Stripe ID |
| stripe_subscription_id | text | Subscription ID |
| status | text | active/canceled |
| current_period_end | timestamp | Renewal date |

### skills
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | FK to users |
| skill_pack_id | text | which pack |
| installed_at | timestamp | When added |

---

## Security

- Containers run as non-root user
- Network isolation via Docker network
- No container-to-container communication
- Secrets injected via environment variables (not baked into images)
- Customer workspace encrypted at rest (optional Phase 2)
- Rate limiting on provisioning API
- Audit logging for all admin actions

---

## Monitoring

### Health Checks
- Container health (Docker native)
- API endpoint health (healthz)
- Disk space alerts

### Metrics to Track
- Active containers
- CPU/memory per container
- API request latency
- Stripe revenue
- New signups / churn

### Logging
- Centralized logging via Loki or CloudWatch
- Container logs persisted to volume
- Retention: 30 days (hot), 1 year (cold)

---

## Cost Estimates

| Resource | Monthly Cost |
|----------|--------------|
| Hetzner CPX21 (4 vCPU, 8GB) | ~$18/mo |
| Can host ~15-20 Starter containers | |
| | |
| Supabase Free Tier | $0 |
| Stripe Fees | 2.9% + $0.30 |
| Domain (clawsrus.com) | ~$15/yr |

**Per-customer cost:** ~$1-2/mo at scale

---

## Troubleshooting

### Container Won't Start
```bash
docker logs clawsrus-{customer-id}
docker inspect clawsrus-{customer-id}
```

### User Can't Connect
- Check Telegram bot token validity
- Verify webhook URL reachable
- Check user's authentication status in DB

### Performance Issues
- Check container resource usage: `docker stats`
- Review OpenClaw logs for errors
- Consider upsizing tier

---

## Scripts

| Script | Purpose |
|--------|---------|
| `scripts/provision-user.sh` | Create new customer instance |
| `scripts/deprovision-user.sh` | Tear down customer instance |
| `scripts/backup-workspace.sh` | Backup customer data |
| `scripts/rotate-logs.sh` | Log rotation |

---

*Last updated: 2026-02-16*
