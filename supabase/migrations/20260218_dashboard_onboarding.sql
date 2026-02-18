-- Dashboard-first onboarding migration
-- Date: 2026-02-18

alter table if exists public.users
  add column if not exists auth_user_id uuid unique,
  add column if not exists preferred_name text,
  add column if not exists timezone text not null default 'UTC',
  add column if not exists dashboard_ready_at timestamptz;

create table if not exists public.user_channels (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references public.users(id) on delete cascade,
  channel text not null check (channel in ('telegram', 'whatsapp', 'imessage')),
  status text not null check (status in ('connected', 'not_connected', 'coming_soon')),
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, channel)
);

insert into public.user_channels (user_id, channel, status, meta)
select u.id, c.channel, c.status, '{}'::jsonb
from public.users u
cross join (
  values
    ('telegram', 'not_connected'),
    ('whatsapp', 'coming_soon'),
    ('imessage', 'coming_soon')
) as c(channel, status)
on conflict (user_id, channel) do nothing;
