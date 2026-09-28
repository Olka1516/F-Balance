-- F-Balance Phase 8: AI request log for rate limits + short cache
-- Run in Supabase Dashboard → SQL Editor after meals migration.

create table if not exists public.ai_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  request_type text not null check (request_type in ('text', 'photo')),
  input_hash text not null,
  calories numeric(10, 2) check (calories is null or calories >= 0),
  created_at timestamptz not null default now()
);

create index if not exists ai_requests_user_created_idx
  on public.ai_requests (user_id, created_at desc);

create index if not exists ai_requests_user_hash_idx
  on public.ai_requests (user_id, input_hash, created_at desc);

alter table public.ai_requests enable row level security;

drop policy if exists "ai_requests_select_own" on public.ai_requests;
drop policy if exists "ai_requests_insert_own" on public.ai_requests;

create policy "ai_requests_select_own" on public.ai_requests
for select to authenticated using (auth.uid() = user_id);

create policy "ai_requests_insert_own" on public.ai_requests
for insert to authenticated with check (auth.uid() = user_id);
