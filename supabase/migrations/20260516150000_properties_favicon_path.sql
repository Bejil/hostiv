-- Favicon par site (fichier dans Storage : {slug}/branding/favicon.*)
alter table public.properties
  add column if not exists favicon_path text;

comment on column public.properties.favicon_path is
  'Chemin relatif du favicon dans le bucket property-assets (ex. /branding/favicon.png).';
