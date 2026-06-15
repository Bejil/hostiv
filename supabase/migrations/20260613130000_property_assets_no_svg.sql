-- Retire SVG du bucket public (risque XSS si servi comme document)

update storage.buckets
set allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/x-icon']::text[]
where id = 'property-assets';
