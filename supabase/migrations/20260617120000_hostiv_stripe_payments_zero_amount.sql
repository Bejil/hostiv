-- Autoriser les paiements à 0 € (codes promo 100 %) dans l'historique revenus Hostiv

alter table public.hostiv_stripe_payments
  drop constraint if exists hostiv_stripe_payments_amount_cents_check;

alter table public.hostiv_stripe_payments
  add constraint hostiv_stripe_payments_amount_cents_check
  check (amount_cents >= 0);

comment on column public.hostiv_stripe_payments.amount_cents is
  'Montant encaissé (centimes). 0 pour un checkout gratuit via code promo 100 %.';
