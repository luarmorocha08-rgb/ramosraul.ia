-- Tabela de leads do formulário de contato.
-- A escrita acontece apenas pelo servidor (service role).
-- RLS ligado e SEM policies públicas: o navegador não lê nem grava aqui.

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null check (char_length(name) between 2 and 120),
  email text not null check (char_length(email) <= 200),
  project_type text not null,
  description text not null check (char_length(description) <= 4000),
  budget text,
  consent boolean not null default false,
  source text not null default 'website',
  user_agent text,
  status text not null default 'new'
);

alter table public.leads enable row level security;

create index if not exists leads_created_at_idx on public.leads (created_at desc);
