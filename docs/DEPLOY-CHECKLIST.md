# Deploy Checklist

Last updated: 2026-02-19

Use this checklist before and after deploys to avoid auth regressions (especially magic-link login).

## 1) Verify env parity before deploy

Public Supabase vars must exist in every environment that serves `/login`.

Required:
- `NEXT_PUBLIC_SUPABASE_URL`
- At least one of:
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

Also required for full app operation:
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `RESEND_API_KEY`
- `NEXT_PUBLIC_APP_URL`

### Vercel (www)

```bash
vercel env list production --scope gremlin-garage
vercel env list preview --scope gremlin-garage
vercel env list development --scope gremlin-garage
```

### Hetzner (app)

```bash
ssh root@app.clawsrus.com "grep -E 'NEXT_PUBLIC_SUPABASE_URL|NEXT_PUBLIC_SUPABASE_ANON_KEY|NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY' /opt/clawsrus/app/.env.production"
```

## 2) Deploy

### Vercel

```bash
vercel deploy --prod --scope gremlin-garage
```

### Hetzner

```bash
ssh root@app.clawsrus.com "cd /opt/clawsrus/app && npm run build && systemctl restart clawsrus-app"
```

## 3) Post-deploy smoke checks

### Env health endpoint

```bash
curl -i https://www.clawsrus.com/api/health/env
curl -i https://app.clawsrus.com/api/health/env
```

Expected:
- HTTP 200
- `\"ok\": true`

### Login UX check

1. Open `/login`.
2. Submit a test email.
3. Confirm no missing-env error is shown.
4. Confirm magic link request succeeds.

## 4) If login fails

1. Check `/api/health/env` on the failing host.
2. Compare Vercel vs Hetzner env vars.
3. Redeploy the failing host after env fixes.
4. Hard refresh browser (or use incognito) to clear stale JS.
