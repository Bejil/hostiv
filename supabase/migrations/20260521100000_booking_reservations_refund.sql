alter table public.booking_reservations
  add column if not exists refunded_at timestamptz,
  add column if not exists stripe_refund_id text;

comment on column public.booking_reservations.refunded_at is
  'Horodatage du remboursement Stripe du voyageur.';
comment on column public.booking_reservations.stripe_refund_id is
  'Identifiant re_… du remboursement Stripe.';
