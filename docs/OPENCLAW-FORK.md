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

Set and document the exact commit/image used for production:

- Fork repository: `github.com/yannick3010/openclaw` (or chosen org fork)
- Commit SHA: `TODO`
- Runtime image tag: `TODO`

## Build

Run upstream control UI build in forked repo:

```bash
pnpm ui:build
```

Then publish runtime image and update provisioning script image/tag accordingly.
