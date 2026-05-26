-- Accès forfait Hostiv : paiement annuel (paid_until), sites nouveaux en brouillon par défaut

alter table public.hostiv_accounts
  add column if not exists paid_until timestamptz,
  add column if not exists subscription_started_at timestamptz;

comment on column public.hostiv_accounts.paid_until is
  'Fin de validité du forfait (paiement annuel unique, sans reconduction automatique).';
comment on column public.hostiv_accounts.subscription_started_at is
  'Date de début de la période payée en cours (optionnel).';

alter table public.properties
  alter column published set default false;
