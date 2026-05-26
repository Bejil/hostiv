-- Sites de location Hestia (contenu éditable par slug)
create extension if not exists "pgcrypto";

create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  published boolean not null default true,
  brand_name text not null,
  brand_meta text,
  logo_path text not null,
  seo_title text not null,
  seo_description text not null,
  hero_image_path text not null,
  hero_image_alt text,
  testimonials_bg_path text not null,
  host_photo_path text not null,
  booking_config jsonb not null default '{}'::jsonb,
  location jsonb not null default '{}'::jsonb,
  content jsonb not null default '{}'::jsonb,
  calendar_config jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint properties_slug_unique unique (slug)
);

create index if not exists properties_slug_published_idx
  on public.properties (slug)
  where published = true;

create or replace function public.set_properties_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists properties_set_updated_at on public.properties;
create trigger properties_set_updated_at
  before update on public.properties
  for each row
  execute function public.set_properties_updated_at();

alter table public.properties enable row level security;

drop policy if exists "properties_public_read" on public.properties;
create policy "properties_public_read"
  on public.properties
  for select
  to anon, authenticated
  using (published = true);
