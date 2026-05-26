-- Propriétaire Supabase Auth lié à chaque site (backoffice /:slug/admin)
alter table public.properties
  add column if not exists owner_user_id uuid references auth.users (id) on delete set null;

create index if not exists properties_owner_user_id_idx
  on public.properties (owner_user_id);

comment on column public.properties.owner_user_id is
  'UID auth.users du propriétaire autorisé à modifier ce site via le backoffice.';

-- Lecture / mise à jour par le propriétaire connecté (client Supabase direct)
drop policy if exists "properties_owner_read" on public.properties;
create policy "properties_owner_read"
  on public.properties
  for select
  to authenticated
  using (auth.uid() = owner_user_id);

drop policy if exists "properties_owner_update" on public.properties;
create policy "properties_owner_update"
  on public.properties
  for update
  to authenticated
  using (auth.uid() = owner_user_id)
  with check (auth.uid() = owner_user_id);
