-- Co-hôtes : accès partagé au backoffice d'une propriété

create table if not exists public.property_cohosts (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  invited_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  constraint property_cohosts_property_user_unique unique (property_id, user_id)
);

create index if not exists property_cohosts_user_id_idx
  on public.property_cohosts (user_id);

create index if not exists property_cohosts_property_id_idx
  on public.property_cohosts (property_id);

comment on table public.property_cohosts is
  'Co-hôtes ayant accès au backoffice d''une propriété.';

create table if not exists public.property_cohost_invitations (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties (id) on delete cascade,
  email text not null,
  token text not null,
  invited_by uuid not null references auth.users (id) on delete cascade,
  expires_at timestamptz not null,
  accepted_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  constraint property_cohost_invitations_token_unique unique (token)
);

create index if not exists property_cohost_invitations_token_active_idx
  on public.property_cohost_invitations (token)
  where accepted_at is null and revoked_at is null;

create index if not exists property_cohost_invitations_property_active_idx
  on public.property_cohost_invitations (property_id, created_at desc)
  where accepted_at is null and revoked_at is null;

comment on table public.property_cohost_invitations is
  'Invitations co-hôte en attente (valides 7 jours).';

alter table public.property_cohosts enable row level security;
alter table public.property_cohost_invitations enable row level security;

-- Lecture propriété pour les co-hôtes (client Supabase : résolution admin path)
drop policy if exists properties_cohost_read on public.properties;

create policy properties_cohost_read on public.properties
  for select
  using (
    exists (
      select 1
      from public.property_cohosts pc
      where pc.property_id = properties.id
        and pc.user_id = auth.uid()
    )
  );
