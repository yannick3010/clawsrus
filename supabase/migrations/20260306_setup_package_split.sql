-- Separate one-time setup package from membership plan semantics.
-- setup_package: standard|concierge (onboarding package)
-- tier: free|pro (membership/entitlement state)

alter table if exists public.users
  add column if not exists setup_package text;

update public.users
set setup_package = case
  when lower(coalesce(setup_package, '')) in ('standard', 'concierge') then lower(setup_package)
  when lower(coalesce(tier, '')) in ('concierge', 'agency', 'enterprise') then 'concierge'
  when lower(coalesce(tier, '')) = 'standard' then 'standard'
  else 'standard'
end
where setup_package is null
   or lower(coalesce(setup_package, '')) not in ('standard', 'concierge');

alter table if exists public.users
  alter column setup_package set default 'standard';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'users_setup_package_check'
  ) then
    alter table public.users
      add constraint users_setup_package_check
      check (setup_package in ('standard', 'concierge'));
  end if;
end $$;

create index if not exists users_setup_package_idx
  on public.users(setup_package);
