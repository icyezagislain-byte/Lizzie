-- Run this migration in the Supabase SQL Editor before enabling interview saves.
-- The API uses the server-only service_role key and enforces Clerk ownership checks.

create table if not exists public.cbhi_interviews (
  id uuid primary key default gen_random_uuid(),
  owner_user_id text not null,
  interview_code text,
  status text not null default 'draft' check (status in ('draft', 'submitted')),
  answers jsonb not null default '{}'::jsonb,
  skipped_questions integer[] not null default '{}',
  active_question integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  submitted_at timestamptz
);

create table if not exists public.minaloc_interviews (
  id uuid primary key default gen_random_uuid(),
  owner_user_id text not null,
  interview_code text,
  status text not null default 'draft' check (status in ('draft', 'submitted')),
  answers jsonb not null default '{}'::jsonb,
  skipped_questions integer[] not null default '{}',
  active_question integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  submitted_at timestamptz
);

create table if not exists public.rssb_interviews (
  id uuid primary key default gen_random_uuid(),
  owner_user_id text not null,
  interview_code text,
  status text not null default 'draft' check (status in ('draft', 'submitted')),
  answers jsonb not null default '{}'::jsonb,
  skipped_questions integer[] not null default '{}',
  active_question integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  submitted_at timestamptz
);

create index if not exists cbhi_interviews_owner_updated_idx
  on public.cbhi_interviews (owner_user_id, updated_at desc);
create index if not exists minaloc_interviews_owner_updated_idx
  on public.minaloc_interviews (owner_user_id, updated_at desc);
create index if not exists rssb_interviews_owner_updated_idx
  on public.rssb_interviews (owner_user_id, updated_at desc);

alter table public.cbhi_interviews enable row level security;
alter table public.minaloc_interviews enable row level security;
alter table public.rssb_interviews enable row level security;

revoke all on table public.cbhi_interviews, public.minaloc_interviews, public.rssb_interviews
  from anon, authenticated;
grant select, insert, update, delete on table public.cbhi_interviews, public.minaloc_interviews, public.rssb_interviews
  to service_role;
