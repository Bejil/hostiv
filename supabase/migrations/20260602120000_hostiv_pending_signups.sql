-- Inscriptions Hostiv : données en attente jusqu’au paiement Stripe

create table if not exists public.hostiv_pending_signups (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  password_ciphertext text not null,
  full_name text not null,
  property_name text not null,
  property_slug text not null,
  subscription_plan text not null default 'pro'
    constraint hostiv_pending_signups_plan_check
    check (subscription_plan in ('starter', 'pro')),
  stripe_session_id text,
  status text not null default 'pending'
    constraint hostiv_pending_signups_status_check
    check (status in ('pending', 'completed', 'failed')),
  user_id uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  completed_at timestamptz
);

create index if not exists hostiv_pending_signups_email_pending_idx
  on public.hostiv_pending_signups (lower(email))
  where status = 'pending';

create index if not exists hostiv_pending_signups_stripe_session_idx
  on public.hostiv_pending_signups (stripe_session_id)
  where stripe_session_id is not null;

comment on table public.hostiv_pending_signups is
  'Données d’inscription chiffrées, converties en compte + site après paiement Stripe.';

alter table public.hostiv_pending_signups enable row level security;

drop policy if exists "hostiv_pending_signups_service_role_all" on public.hostiv_pending_signups;
create policy "hostiv_pending_signups_service_role_all"
  on public.hostiv_pending_signups
  for all
  to service_role
  using (true)
  with check (true);

create or replace function public.hostiv_auth_email_exists(check_email text)
returns boolean
language sql
security definer
set search_path = auth, public
stable
as $$
  select exists (
    select 1
    from auth.users u
    where lower(u.email) = lower(trim(check_email))
  );
$$;

comment on function public.hostiv_auth_email_exists is
  'Vérifie si un e-mail est déjà enregistré (service role uniquement).';

revoke all on function public.hostiv_auth_email_exists(text) from public;
grant execute on function public.hostiv_auth_email_exists(text) to service_role;
