alter table public.booking_reservations
  add column if not exists review_token text,
  add column if not exists review_request_sent_at timestamptz;

create unique index if not exists booking_reservations_review_token_idx
  on public.booking_reservations (review_token)
  where review_token is not null;

comment on column public.booking_reservations.review_token is
  'Jeton unique pour le formulaire d’avis post-séjour (valide 7 jours après le départ).';
comment on column public.booking_reservations.review_request_sent_at is
  'Date d’envoi de l’e-mail invitant à laisser un avis.';

create table if not exists public.guest_reviews (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  property_slug text not null,
  reservation_id uuid not null references public.booking_reservations(id) on delete cascade,
  guest_first_name text not null,
  guest_last_name text not null,
  guest_email text not null,
  arrival_date date not null,
  departure_date date not null,
  rating smallint not null,
  comment text not null,
  created_at timestamptz not null default now(),
  constraint guest_reviews_rating_check check (rating between 1 and 5),
  constraint guest_reviews_reservation_unique unique (reservation_id)
);

create index if not exists guest_reviews_property_slug_created_idx
  on public.guest_reviews (property_slug, created_at desc);

create index if not exists guest_reviews_property_slug_rating_idx
  on public.guest_reviews (property_slug, rating desc);

alter table public.guest_reviews enable row level security;
