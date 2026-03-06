# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ClawsRUs is a managed AI assistant product built on OpenClaw. Users purchase a setup package (Standard $199 or Concierge $599), get a 7-day Pro trial, then choose Free or Pro membership. Each customer gets an isolated OpenClaw instance running in a Docker container on a Hetzner VPS.

## Commands

```bash
npm run dev          # Start dev server (custom server via tsx server/index.ts)
npm run build        # Next.js production build
npm run start        # Production server (NODE_ENV=production tsx server/index.ts)
npm run lint         # next lint
```

## Architecture

### Two-Host Deployment

- **www.clawsrus.com** → Vercel (auto-deploy from main) — marketing/homepage only
- **app.clawsrus.com** → Hetzner VPS at 178.156.228.173 — app, dashboard, agent proxy. CI deploys via `.github/workflows/deploy-vps.yml` on push to main.

### Custom Server (`server/index.ts`)

The app uses a custom Node HTTP server wrapping Next.js — NOT the default `next start`. This server handles:
- All standard Next.js routes via `app.getRequestHandler()`
- `/agent-ui/*` — HTTP reverse proxy to user's OpenClaw container
- `/agent-ws/*` — WebSocket reverse proxy to user's OpenClaw container
- Proxy auth via `claws_proxy_session` cookie or `proxy_token` query param, verified through `lib/proxy-token.ts`
- Container resolution via `lib/docker-gateway-resolver.ts` (looks up user's Docker container IP)

### Key Directories

- `app/` — Next.js App Router pages and API routes
- `app/api/` — API routes: `agent/`, `auth/`, `billing/`, `checkout/`, `dashboard/`, `health/`, `setup/`, `webhooks/stripe/`
- `components/` — Homepage sections (Hero, Pricing, FAQ, etc.) and dashboard components
- `lib/` — Shared utilities: Supabase clients, Stripe, plans, skills/entitlements, proxy tokens, metadata stripping
- `server/` — Custom HTTP server with OpenClaw container proxy
- `scripts/` — VPS provisioning, Telegram setup, skill management, OpenClaw runtime build
- `supabase/migrations/` — Database migrations (applied manually)
- `templates/` — OpenClaw persona templates (personal-assistant, chief-of-staff, sales-expert)
- `docker/` — `openclaw-runtime.Dockerfile`

### Auth & Middleware

- Supabase Auth with SSR (`@supabase/ssr`)
- `middleware.ts` protects `/dashboard/*`, `/api/dashboard/*`, `/api/agent/proxy-token` — redirects unauthenticated users to `/login`
- Three Supabase client patterns:
  - `lib/supabase.ts` — service-role client (server-side admin operations)
  - `lib/supabase-server.ts` — per-request server client with cookie auth
  - `lib/supabase-browser.ts` — browser client

### Payments

- Stripe one-time payments for setup packages (not subscriptions)
- Plans: Free and Pro (`lib/plans.ts` — `normalizePlanCode()` maps legacy tier names)
- Webhook handler at `app/api/webhooks/stripe/`

### OpenClaw Metadata Stripping

The OpenClaw gateway prepends untrusted metadata JSON to messages. Must use brace-walking parser (NOT simple regex) because metadata contains nested objects. Shared utility at `lib/strip-openclaw-metadata.ts`. Three stripping layers exist: delta handler, aborted fallback, and render boundary safety net in ChatThread.

### Design System

- Tailwind CSS with custom color tokens: `brand-*` (green), `ink-*` (neutral text), `surface-*` (backgrounds), `status-*`
- Fonts: `font-display` (Instrument Serif), `font-body` (DM Sans) — loaded via `next/font/google`
- Path alias: `@/*` maps to project root

### Current MVP Constraints

- Only Personal Assistant persona is active; Chief of Staff and Sales Expert are "Coming Soon"
- AI model: `minimax/minimax-m2.5` via OpenRouter (not BYOK)
- 2-step setup: Telegram bot token only
- VPS path: `/opt/clawsrus/` with systemd service `clawsrus-app`
