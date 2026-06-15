-- Journal des actions sensibles de l’admin plateforme Hostiv (/admin)

create table if not exists public.platform_admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid,
  actor_email text not null,
  action text not null,
  target_type text not null,
  target_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists platform_admin_audit_logs_created_at_idx
  on public.platform_admin_audit_logs (created_at desc);

create index if not exists platform_admin_audit_logs_action_idx
  on public.platform_admin_audit_logs (action, created_at desc);

comment on table public.platform_admin_audit_logs is
  'Traçabilité des actions destructives ou sensibles des administrateurs plateforme Hostiv.';

alter table public.platform_admin_audit_logs enable row level security;

drop policy if exists "platform_admin_audit_logs_service_role_all" on public.platform_admin_audit_logs;
create policy "platform_admin_audit_logs_service_role_all"
  on public.platform_admin_audit_logs
  for all
  to service_role
  using (true)
  with check (true);
