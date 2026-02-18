-- Add signup onboarding fields
-- Date: 2026-02-19

alter table if exists public.users
  add column if not exists role text,
  add column if not exists help_topics jsonb not null default '[]'::jsonb,
  add column if not exists communication_style text,
  add column if not exists top_priorities jsonb not null default '[]'::jsonb;
