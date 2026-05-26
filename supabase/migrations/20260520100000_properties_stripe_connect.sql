-- Stripe Connect Express — versements hôte par propriété
alter table public.properties
  add column if not exists stripe_account_id text,
  add column if not exists stripe_charges_enabled boolean not null default false,
  add column if not exists stripe_payouts_enabled boolean not null default false,
  add column if not exists stripe_details_submitted boolean not null default false,
  add column if not exists stripe_onboarding_completed_at timestamptz;

create unique index if not exists properties_stripe_account_id_unique
  on public.properties (stripe_account_id)
  where stripe_account_id is not null;

comment on column public.properties.stripe_account_id is
  'Compte Stripe Connect Express (acct_…) pour encaisser les réservations.';
comment on column public.properties.stripe_charges_enabled is
  'true lorsque le compte connecté peut recevoir des paiements carte.';
comment on column public.properties.stripe_payouts_enabled is
  'true lorsque les virements vers le compte bancaire de l’hôte sont actifs.';
comment on column public.properties.stripe_details_submitted is
  'true lorsque l’onboarding Express a été soumis à Stripe.';
comment on column public.properties.stripe_onboarding_completed_at is
  'Horodatage de la première activation des paiements (charges_enabled).';
