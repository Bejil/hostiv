-- Forfait Hostiv : compte (inscription) + propriété (fonctionnalités du site)

create table if not exists public.hostiv_accounts (
  id uuid primary key references auth.users (id) on delete cascade,
  subscription_plan text not null default 'pro'
    constraint hostiv_accounts_subscription_plan_check
    check (subscription_plan in ('starter', 'pro')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.hostiv_accounts is
  'Forfait Hostiv par utilisateur (1 compte = 1 logement). Rempli à l’inscription via trigger auth.';
comment on column public.hostiv_accounts.subscription_plan is
  'starter | pro — choix à l’inscription (user_metadata.subscription_plan).';

create or replace function public.set_hostiv_accounts_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists hostiv_accounts_set_updated_at on public.hostiv_accounts;
create trigger hostiv_accounts_set_updated_at
  before update on public.hostiv_accounts
  for each row
  execute function public.set_hostiv_accounts_updated_at();

alter table public.hostiv_accounts enable row level security;

drop policy if exists "hostiv_accounts_read_own" on public.hostiv_accounts;
create policy "hostiv_accounts_read_own"
  on public.hostiv_accounts
  for select
  to authenticated
  using (auth.uid() = id);

drop policy if exists "hostiv_accounts_service_role_all" on public.hostiv_accounts;
create policy "hostiv_accounts_service_role_all"
  on public.hostiv_accounts
  for all
  to service_role
  using (true)
  with check (true);

create or replace function public.normalize_hostiv_subscription_plan(raw text)
returns text
language sql
immutable
as $$
  select case
    when lower(trim(coalesce(raw, ''))) = 'starter' then 'starter'
    else 'pro'
  end;
$$;

create or replace function public.handle_new_hostiv_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  plan text;
begin
  plan := public.normalize_hostiv_subscription_plan(new.raw_user_meta_data->>'subscription_plan');

  insert into public.hostiv_accounts (id, subscription_plan)
  values (new.id, plan)
  on conflict (id) do update
    set subscription_plan = excluded.subscription_plan,
        updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_hostiv on auth.users;
create trigger on_auth_user_created_hostiv
  after insert on auth.users
  for each row
  execute function public.handle_new_hostiv_user();

alter table public.properties
  add column if not exists subscription_plan text not null default 'pro'
    constraint properties_subscription_plan_check
    check (subscription_plan in ('starter', 'pro'));

comment on column public.properties.subscription_plan is
  'Forfait Hostiv du site (starter | pro). Synchronisé depuis hostiv_accounts quand owner_user_id est défini.';

create or replace function public.sync_property_subscription_plan_from_owner()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  plan text;
begin
  if new.owner_user_id is null then
    return new;
  end if;

  select subscription_plan
  into plan
  from public.hostiv_accounts
  where id = new.owner_user_id;

  if plan is not null then
    new.subscription_plan := plan;
  end if;

  return new;
end;
$$;

drop trigger if exists properties_sync_subscription_plan on public.properties;
create trigger properties_sync_subscription_plan
  before insert or update of owner_user_id on public.properties
  for each row
  execute function public.sync_property_subscription_plan_from_owner();

-- Comptes existants déjà liés à une propriété
insert into public.hostiv_accounts (id, subscription_plan)
select distinct owner_user_id, 'pro'
from public.properties
where owner_user_id is not null
on conflict (id) do nothing;

update public.properties p
set subscription_plan = coalesce(a.subscription_plan, 'pro')
from public.hostiv_accounts a
where p.owner_user_id = a.id;
