-- Abonnement Hostiv par propriété (multi-logements)

alter table public.properties
  add column if not exists paid_until timestamptz,
  add column if not exists subscription_started_at timestamptz,
  add column if not exists premium_tools_until timestamptz,
  add column if not exists premium_tools_started_at timestamptz,
  add column if not exists subscription_reminders_sent jsonb;

comment on column public.properties.paid_until is
  'Fin de validité du forfait Hostiv pour ce logement.';

comment on column public.properties.subscription_started_at is
  'Début de la période d’abonnement en cours pour ce logement.';

comment on column public.properties.premium_tools_until is
  'Fin de validité Starter + pour ce logement.';

comment on column public.properties.premium_tools_started_at is
  'Début Starter + pour ce logement.';

comment on column public.properties.subscription_reminders_sent is
  'Rappels e-mail avant expiration : { paid_until, sent: ["30d","7d","1d"] }.';

-- Reprise des abonnements existants (1 compte = 1 logement historique)
update public.properties p
set
  paid_until = a.paid_until,
  subscription_started_at = a.subscription_started_at,
  premium_tools_until = a.premium_tools_until,
  premium_tools_started_at = a.premium_tools_started_at,
  subscription_reminders_sent = a.subscription_reminders_sent
from public.hostiv_accounts a
where p.owner_user_id = a.id
  and p.paid_until is null
  and a.paid_until is not null;

update public.properties p
set subscription_plan = a.subscription_plan
from public.hostiv_accounts a
where p.owner_user_id = a.id
  and coalesce(p.subscription_plan, '') = '';

comment on table public.hostiv_accounts is
  'Profil Hostiv par utilisateur (identité, e-mails). L’abonnement actif est porté par chaque propriété.';
