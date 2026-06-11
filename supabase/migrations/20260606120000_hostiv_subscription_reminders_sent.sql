alter table public.hostiv_accounts
  add column if not exists subscription_reminders_sent jsonb not null default '{}'::jsonb;

comment on column public.hostiv_accounts.subscription_reminders_sent is
  'Rappels e-mail avant expiration du forfait : { paid_until, sent: ["30d","7d","1d"] }.';
