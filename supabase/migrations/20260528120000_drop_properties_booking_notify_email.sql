-- Les notifications de réservation utilisent l’e-mail du compte Hostiv (owner_user_id → auth.users).
alter table public.properties
  drop column if exists booking_notify_email;
