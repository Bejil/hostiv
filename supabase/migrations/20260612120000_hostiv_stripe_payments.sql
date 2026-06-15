-- Historique des paiements Stripe Hostiv (forfaits et Starter+)

create table if not exists public.hostiv_stripe_payments (
  id uuid primary key default gen_random_uuid(),
  stripe_checkout_session_id text not null unique,
  stripe_payment_intent_id text unique,
  user_id uuid references auth.users (id) on delete set null,
  member_email text,
  property_slug text,
  checkout_type text not null
    constraint hostiv_stripe_payments_checkout_type_check
    check (checkout_type in ('hostiv_signup', 'hostiv_subscription', 'hostiv_premium_tools')),
  subscription_plan text
    constraint hostiv_stripe_payments_subscription_plan_check
    check (subscription_plan is null or subscription_plan in ('starter', 'pro')),
  product_label text not null,
  amount_cents integer not null
    constraint hostiv_stripe_payments_amount_cents_check
    check (amount_cents > 0),
  currency text not null default 'eur',
  payment_status text not null default 'paid'
    constraint hostiv_stripe_payments_payment_status_check
    check (payment_status in ('paid', 'refunded')),
  paid_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists hostiv_stripe_payments_paid_at_idx
  on public.hostiv_stripe_payments (paid_at desc);

create index if not exists hostiv_stripe_payments_user_id_idx
  on public.hostiv_stripe_payments (user_id)
  where user_id is not null;

create index if not exists hostiv_stripe_payments_checkout_type_idx
  on public.hostiv_stripe_payments (checkout_type);

comment on table public.hostiv_stripe_payments is
  'Paiements Stripe Hostiv (inscription, renouvellement forfait, Starter+).';

alter table public.hostiv_stripe_payments enable row level security;

drop policy if exists "hostiv_stripe_payments_service_role_all" on public.hostiv_stripe_payments;
create policy "hostiv_stripe_payments_service_role_all"
  on public.hostiv_stripe_payments
  for all
  to service_role
  using (true)
  with check (true);
