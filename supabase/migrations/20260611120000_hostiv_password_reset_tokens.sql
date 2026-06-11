create table if not exists public.hostiv_password_reset_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  email text not null,
  token text not null,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now(),
  constraint hostiv_password_reset_tokens_token_unique unique (token)
);

create index if not exists hostiv_password_reset_tokens_token_active_idx
  on public.hostiv_password_reset_tokens (token)
  where used_at is null;

create index if not exists hostiv_password_reset_tokens_user_active_idx
  on public.hostiv_password_reset_tokens (user_id, created_at desc)
  where used_at is null;

comment on table public.hostiv_password_reset_tokens is
  'Jetons de réinitialisation de mot de passe Hostiv (valides 24 h).';

alter table public.hostiv_password_reset_tokens enable row level security;
