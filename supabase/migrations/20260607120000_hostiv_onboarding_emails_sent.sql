alter table public.hostiv_accounts
  add column if not exists onboarding_emails_sent jsonb not null default '{}'::jsonb;

comment on column public.hostiv_accounts.onboarding_emails_sent is
  'E-mails d’onboarding envoyés : { publish_reminder, stripe_reminder } (ISO timestamps).';
