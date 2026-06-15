-- Durcissement sécurité properties : pas de UPDATE direct client, token ICS aléatoire par site

-- Les modifications passent par l’API serveur (service_role), pas le client Supabase JWT.
drop policy if exists "properties_owner_update" on public.properties;

alter table public.properties
  add column if not exists reservations_ics_token text;

comment on column public.properties.reservations_ics_token is
  'Jeton opaque pour le flux ICS des réservations (/api/calendar/:slug/reservations.ics). Révocable via l’admin.';

create unique index if not exists properties_reservations_ics_token_unique
  on public.properties (reservations_ics_token)
  where reservations_ics_token is not null;
