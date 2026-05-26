-- Assets des sites location (images par slug : {slug}/gallery/..., etc.)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'property-assets',
  'property-assets',
  true,
  52428800,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']::text[]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "property_assets_public_read" on storage.objects;
create policy "property_assets_public_read"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'property-assets');
