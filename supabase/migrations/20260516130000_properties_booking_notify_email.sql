-- Destinataire des demandes de réservation par site (non exposé au client)
alter table public.properties
  add column if not exists booking_notify_email text;

comment on column public.properties.booking_notify_email is
  'Adresse e-mail de l’hôte pour recevoir les demandes et confirmations de réservation.';
