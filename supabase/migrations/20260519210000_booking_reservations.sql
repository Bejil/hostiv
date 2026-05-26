create table if not exists public.booking_reservations (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  property_slug text not null,
  stripe_payment_intent_id text unique,
  status text not null default 'confirmed',
  arrival_date date not null,
  departure_date date not null,
  stay_nights integer not null,
  adults integer not null,
  children integer not null default 0,
  babies integer not null default 0,
  main_guests integer not null,
  guest_first_name text not null,
  guest_last_name text not null,
  guest_email text not null,
  guest_phone text not null,
  message text not null default '',
  total_eur numeric(10, 2) not null,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint booking_reservations_status_check check (status in ('confirmed', 'cancelled')),
  constraint booking_reservations_dates_check check (departure_date > arrival_date)
);

create index if not exists booking_reservations_property_arrival_idx
  on public.booking_reservations (property_id, arrival_date);

create index if not exists booking_reservations_property_slug_idx
  on public.booking_reservations (property_slug);

create or replace function public.set_booking_reservations_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists booking_reservations_set_updated_at on public.booking_reservations;
create trigger booking_reservations_set_updated_at
  before update on public.booking_reservations
  for each row
  execute function public.set_booking_reservations_updated_at();

alter table public.booking_reservations enable row level security;
