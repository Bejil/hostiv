-- Codes promo Hostiv (forfaits inscription / renouvellement / Starter+ / ajout logement)

create table if not exists public.hostiv_promo_codes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  code text not null,
  valid_from timestamptz not null,
  valid_until timestamptz not null,
  discount_percent integer not null
    constraint hostiv_promo_codes_discount_percent_check
    check (discount_percent between 1 and 100),
  allowed_emails text not null default '*',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint hostiv_promo_codes_code_unique unique (code),
  constraint hostiv_promo_codes_valid_range check (valid_until > valid_from)
);

create index if not exists hostiv_promo_codes_code_lower_idx
  on public.hostiv_promo_codes (lower(code));

create index if not exists hostiv_promo_codes_valid_until_idx
  on public.hostiv_promo_codes (valid_until desc);

comment on table public.hostiv_promo_codes is
  'Codes promo Hostiv pour les paiements forfait (réduction en %, restriction e-mail optionnelle).';

comment on column public.hostiv_promo_codes.allowed_emails is
  'Astérisque * = tous les e-mails, sinon liste séparée par des virgules.';

create or replace function public.set_hostiv_promo_codes_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists hostiv_promo_codes_set_updated_at on public.hostiv_promo_codes;
create trigger hostiv_promo_codes_set_updated_at
  before update on public.hostiv_promo_codes
  for each row
  execute function public.set_hostiv_promo_codes_updated_at();

alter table public.hostiv_promo_codes enable row level security;

drop policy if exists "hostiv_promo_codes_service_role_all" on public.hostiv_promo_codes;
create policy "hostiv_promo_codes_service_role_all"
  on public.hostiv_promo_codes
  for all
  to service_role
  using (true)
  with check (true);

alter table public.hostiv_stripe_payments
  add column if not exists promo_code text,
  add column if not exists promo_code_id uuid references public.hostiv_promo_codes (id) on delete set null,
  add column if not exists amount_subtotal_cents integer,
  add column if not exists discount_cents integer;

comment on column public.hostiv_stripe_payments.promo_code is
  'Code promo appliqué au paiement, le cas échéant.';
comment on column public.hostiv_stripe_payments.amount_subtotal_cents is
  'Montant catalogue avant réduction (centimes).';
comment on column public.hostiv_stripe_payments.discount_cents is
  'Réduction accordée (centimes).';
