# OpenClaw Fork Pin (Dashboard Embed)

This project depends on a forked OpenClaw Control UI for embedded chat-first mode.

## Required fork capabilities

- `embed=1` renders chat-first minimal UI
- Non-v1 surfaces hidden in embed mode (cron, config, nodes, skills)
- Embedding headers allow same-origin iframe usage:
  - `X-Frame-Options: SAMEORIGIN`
  - CSP `frame-ancestors 'self'`
- Embedded `gatewayUrl` override works for `/agent-ws` proxy path

## Pinning

Current pinned runtime inputs:

- Repository: `https://github.com/openclaw/openclaw`
- Commit SHA: `4134875c311fbb7f677fb9181a883431444cf3e9`
- Package version: `openclaw@2026.2.17`
- Runtime image tag: `clawsrus/openclaw-runtime:2026.2.17-r1`

## Build

Build the pinned runtime image from this repo:

```bash
./scripts/build-openclaw-runtime-image.sh clawsrus/openclaw-runtime:2026.2.17-r1
```

The image is consumed by provisioning via `OPENCLAW_IMAGE`.
