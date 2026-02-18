-- Add per-user runtime gateway token for dashboard chat auth
-- Date: 2026-02-20

alter table if exists public.users
  add column if not exists gateway_token text;
