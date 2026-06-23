-- Statistiques de trafic des sites publics (pages vues et visiteurs uniques / jour)

create table if not exists public.property_traffic_daily (
  property_id uuid not null references public.properties (id) on delete cascade,
  day date not null,
  page_views integer not null default 0
    constraint property_traffic_daily_page_views_check check (page_views >= 0),
  unique_visitors integer not null default 0
    constraint property_traffic_daily_unique_visitors_check check (unique_visitors >= 0),
  primary key (property_id, day)
);

create index if not exists property_traffic_daily_day_idx
  on public.property_traffic_daily (day desc);

create table if not exists public.property_traffic_visitor_daily (
  property_id uuid not null references public.properties (id) on delete cascade,
  day date not null,
  visitor_hash text not null,
  primary key (property_id, day, visitor_hash)
);

comment on table public.property_traffic_daily is
  'Agrégats journaliers de trafic par site (fuseau Europe/Paris).';
comment on table public.property_traffic_visitor_daily is
  'Empreintes visiteur / jour pour dédupliquer les visiteurs uniques.';

create or replace function public.record_property_traffic(
  p_property_id uuid,
  p_day date,
  p_visitor_hash text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_new_visitor integer := 0;
begin
  insert into public.property_traffic_visitor_daily (property_id, day, visitor_hash)
  values (p_property_id, p_day, p_visitor_hash)
  on conflict do nothing;

  get diagnostics v_new_visitor = row_count;

  insert into public.property_traffic_daily as daily (property_id, day, page_views, unique_visitors)
  values (p_property_id, p_day, 1, v_new_visitor)
  on conflict (property_id, day) do update
  set
    page_views = daily.page_views + 1,
    unique_visitors = daily.unique_visitors + v_new_visitor;
end;
$$;

alter table public.property_traffic_daily enable row level security;
alter table public.property_traffic_visitor_daily enable row level security;

drop policy if exists "property_traffic_daily_service_role_all" on public.property_traffic_daily;
create policy "property_traffic_daily_service_role_all"
  on public.property_traffic_daily
  for all
  to service_role
  using (true)
  with check (true);

drop policy if exists "property_traffic_visitor_daily_service_role_all" on public.property_traffic_visitor_daily;
create policy "property_traffic_visitor_daily_service_role_all"
  on public.property_traffic_visitor_daily
  for all
  to service_role
  using (true)
  with check (true);
