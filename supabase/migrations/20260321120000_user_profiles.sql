-- F-Balance Phase 3: user profiles + RLS
-- Run in Supabase Dashboard → SQL Editor (or via CLI migrate).

create table if not exists public.user_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  goal text check (goal is null or goal in ('lose', 'maintain', 'gain')),
  weight numeric(6, 2) check (weight is null or (weight >= 20 and weight <= 400)),
  height numeric(6, 2) check (height is null or (height >= 80 and height <= 280)),
  age integer check (age is null or (age >= 10 and age <= 120)),
  activity_level text check (
    activity_level is null
    or activity_level in ('sedentary', 'light', 'moderate', 'active', 'very_active')
  ),
  daily_calories integer check (
    daily_calories is null
    or (daily_calories >= 800 and daily_calories <= 8000)
  ),
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_user_profiles_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists user_profiles_set_updated_at on public.user_profiles;

create trigger user_profiles_set_updated_at
before update on public.user_profiles
for each row
execute function public.set_user_profiles_updated_at();

alter table public.user_profiles enable row level security;

drop policy if exists "user_profiles_select_own" on public.user_profiles;
drop policy if exists "user_profiles_insert_own" on public.user_profiles;
drop policy if exists "user_profiles_update_own" on public.user_profiles;

create policy "user_profiles_select_own"
on public.user_profiles
for select
to authenticated
using (auth.uid() = user_id);

create policy "user_profiles_insert_own"
on public.user_profiles
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "user_profiles_update_own"
on public.user_profiles
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
