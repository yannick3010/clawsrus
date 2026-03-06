-- Free/Pro hard cutover + skills marketplace foundation
-- Date: 2026-03-02

-- 1) Users plan semantics + setup token
alter table if exists public.users
  add column if not exists setup_token text,
  add column if not exists setup_token_expires_at timestamptz,
  add column if not exists stripe_subscription_id text;

update public.users
set tier = case
  when lower(coalesce(tier, '')) in ('pro', 'concierge', 'agency', 'enterprise') then 'pro'
  else 'free'
end
where tier is distinct from case
  when lower(coalesce(tier, '')) in ('pro', 'concierge', 'agency', 'enterprise') then 'pro'
  else 'free'
end;

alter table if exists public.users
  alter column tier set default 'free';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'users_tier_free_pro_check'
  ) then
    alter table public.users
      add constraint users_tier_free_pro_check
      check (tier in ('free', 'pro'));
  end if;
end $$;

create unique index if not exists users_setup_token_unique_idx
  on public.users (setup_token)
  where setup_token is not null;

-- 2) Pro subscription state
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references public.users(id) on delete cascade,
  plan_code text not null default 'pro' check (plan_code in ('pro')),
  status text not null check (status in ('active', 'trialing', 'past_due', 'canceled')),
  stripe_customer_id text,
  stripe_subscription_id text unique,
  stripe_price_id text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists subscriptions_user_id_idx
  on public.subscriptions(user_id);

create index if not exists subscriptions_status_idx
  on public.subscriptions(status);

-- 3) Skill catalog
create table if not exists public.skills_catalog (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  category text not null,
  is_paid boolean not null default false,
  price_cents integer not null default 0 check (price_cents >= 0),
  stripe_price_id text,
  source_dir text not null,
  skill_md_path text not null,
  summary text not null default '',
  setup_schema jsonb not null default '[]'::jsonb,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists skills_catalog_active_idx
  on public.skills_catalog(active);

create index if not exists skills_catalog_is_paid_idx
  on public.skills_catalog(is_paid);

-- 4) Skill purchases (one-time lifetime ownership)
create table if not exists public.user_skill_purchases (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references public.users(id) on delete cascade,
  skill_slug text not null references public.skills_catalog(slug) on delete cascade,
  stripe_checkout_session_id text unique,
  stripe_payment_intent_id text,
  amount_cents integer not null default 0 check (amount_cents >= 0),
  purchased_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique(user_id, skill_slug)
);

create index if not exists user_skill_purchases_user_id_idx
  on public.user_skill_purchases(user_id);

-- 5) Skill installs and runtime state
create table if not exists public.user_skill_installs (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references public.users(id) on delete cascade,
  skill_slug text not null references public.skills_catalog(slug) on delete cascade,
  status text not null check (
    status in ('setup_in_progress', 'ready_to_activate', 'active', 'locked', 'error')
  ),
  setup_data jsonb not null default '{}'::jsonb,
  last_error text,
  installed_at timestamptz,
  locked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, skill_slug)
);

create index if not exists user_skill_installs_user_id_idx
  on public.user_skill_installs(user_id);

create index if not exists user_skill_installs_status_idx
  on public.user_skill_installs(status);

-- 6) Seed catalog from in-repo skill library (free + paid)
insert into public.skills_catalog (
  slug,
  name,
  category,
  is_paid,
  price_cents,
  stripe_price_id,
  source_dir,
  skill_md_path,
  summary,
  setup_schema,
  active
) values
  (
    'openclaw-copywriting',
    'Copywriting',
    'marketing',
    false,
    0,
    null,
    'skill-library/free/openclaw-copywriting',
    'skill-library/free/openclaw-copywriting/SKILL.md',
    'Write and improve marketing copy for pages, headlines, and CTAs.',
    '[{"id":"brand_voice","label":"Brand voice","type":"text","required":true},{"id":"target_audience","label":"Target audience","type":"text","required":true}]'::jsonb,
    true
  ),
  (
    'openclaw-content-strategy',
    'Content Strategy',
    'marketing',
    false,
    0,
    null,
    'skill-library/free/openclaw-content-strategy',
    'skill-library/free/openclaw-content-strategy/SKILL.md',
    'Plan topics, clusters, and publishing priorities.',
    '[{"id":"goal","label":"Primary content goal","type":"text","required":true}]'::jsonb,
    true
  ),
  (
    'research-pro',
    'Research Pro',
    'research',
    true,
    4900,
    null,
    'skill-library/paid/research-pro',
    'skill-library/paid/research-pro/SKILL.md',
    'Deep multi-source research workflows with structured outputs.',
    '[{"id":"focus_area","label":"Focus area","type":"text","required":true},{"id":"output_format","label":"Output format","type":"text","required":true}]'::jsonb,
    true
  ),
  (
    'calendar-pro',
    'Calendar Pro',
    'operations',
    true,
    1900,
    null,
    'skill-library/paid/calendar-pro',
    'skill-library/paid/calendar-pro/SKILL.md',
    'Scheduling, conflict detection, and timezone-aware planning.',
    '[{"id":"default_timezone","label":"Default timezone","type":"text","required":true},{"id":"work_hours","label":"Work hours","type":"text","required":true}]'::jsonb,
    true
  )
on conflict (slug) do update set
  name = excluded.name,
  category = excluded.category,
  is_paid = excluded.is_paid,
  price_cents = excluded.price_cents,
  source_dir = excluded.source_dir,
  skill_md_path = excluded.skill_md_path,
  summary = excluded.summary,
  setup_schema = excluded.setup_schema,
  active = excluded.active,
  updated_at = now();
