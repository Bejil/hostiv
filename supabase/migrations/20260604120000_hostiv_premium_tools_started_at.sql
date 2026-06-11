alter table public.hostiv_accounts
  add column if not exists premium_tools_started_at timestamptz;

comment on column public.hostiv_accounts.premium_tools_started_at is
  'Date de début de la période Starter + (guide PDF, factures).';
