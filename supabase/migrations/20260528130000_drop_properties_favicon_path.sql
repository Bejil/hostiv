-- Favicon du site = logo (logo_path) ; colonne dédiée supprimée.
alter table public.properties
  drop column if exists favicon_path;
