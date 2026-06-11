-- Starter + : guide d’accueil PDF et factures réservations.

alter table public.hostiv_accounts
  add column if not exists premium_tools_until timestamptz;

comment on column public.hostiv_accounts.premium_tools_until is
  'Starter + actif jusqu’à cette date (guide PDF + factures). Inclus dans le forfait Pro.';
