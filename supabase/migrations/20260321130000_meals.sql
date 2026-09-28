-- F-Balance Phase 4: foods, meals, ingredients, daily entries + RLS
-- Run in Supabase Dashboard → SQL Editor after user_profiles migration.

create table if not exists public.foods (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (char_length(trim(name)) > 0),
  calories numeric(10, 2) not null check (calories >= 0),
  protein numeric(10, 2) not null check (protein >= 0),
  fat numeric(10, 2) not null check (fat >= 0),
  carbs numeric(10, 2) not null check (carbs >= 0),
  source text not null default 'manual'
    check (source in ('manual', 'open_food_facts', 'ai')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.meals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (char_length(trim(name)) > 0),
  meal_type text not null
    check (meal_type in ('breakfast', 'lunch', 'dinner', 'snack')),
  total_weight numeric(10, 2) not null check (total_weight > 0),
  calories numeric(10, 2) not null check (calories >= 0),
  protein numeric(10, 2) not null check (protein >= 0),
  fat numeric(10, 2) not null check (fat >= 0),
  carbs numeric(10, 2) not null check (carbs >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.meal_ingredients (
  id uuid primary key default gen_random_uuid(),
  meal_id uuid not null references public.meals (id) on delete cascade,
  food_id uuid not null references public.foods (id) on delete restrict,
  amount numeric(10, 2) not null check (amount > 0),
  unique (meal_id, food_id)
);

create table if not exists public.daily_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  meal_id uuid not null references public.meals (id) on delete cascade,
  entry_date date not null,
  amount numeric(10, 2) not null default 1 check (amount > 0),
  created_at timestamptz not null default now()
);

create index if not exists foods_user_id_idx on public.foods (user_id);
create index if not exists meals_user_id_idx on public.meals (user_id);
create index if not exists meal_ingredients_meal_id_idx on public.meal_ingredients (meal_id);
create index if not exists daily_entries_user_date_idx
  on public.daily_entries (user_id, entry_date);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists foods_set_updated_at on public.foods;
create trigger foods_set_updated_at
before update on public.foods
for each row
execute function public.set_updated_at();

drop trigger if exists meals_set_updated_at on public.meals;
create trigger meals_set_updated_at
before update on public.meals
for each row
execute function public.set_updated_at();

alter table public.foods enable row level security;
alter table public.meals enable row level security;
alter table public.meal_ingredients enable row level security;
alter table public.daily_entries enable row level security;

drop policy if exists "foods_select_own" on public.foods;
drop policy if exists "foods_insert_own" on public.foods;
drop policy if exists "foods_update_own" on public.foods;
drop policy if exists "foods_delete_own" on public.foods;

create policy "foods_select_own" on public.foods
for select to authenticated using (auth.uid() = user_id);
create policy "foods_insert_own" on public.foods
for insert to authenticated with check (auth.uid() = user_id);
create policy "foods_update_own" on public.foods
for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "foods_delete_own" on public.foods
for delete to authenticated using (auth.uid() = user_id);

drop policy if exists "meals_select_own" on public.meals;
drop policy if exists "meals_insert_own" on public.meals;
drop policy if exists "meals_update_own" on public.meals;
drop policy if exists "meals_delete_own" on public.meals;

create policy "meals_select_own" on public.meals
for select to authenticated using (auth.uid() = user_id);
create policy "meals_insert_own" on public.meals
for insert to authenticated with check (auth.uid() = user_id);
create policy "meals_update_own" on public.meals
for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "meals_delete_own" on public.meals
for delete to authenticated using (auth.uid() = user_id);

drop policy if exists "meal_ingredients_select_own" on public.meal_ingredients;
drop policy if exists "meal_ingredients_insert_own" on public.meal_ingredients;
drop policy if exists "meal_ingredients_update_own" on public.meal_ingredients;
drop policy if exists "meal_ingredients_delete_own" on public.meal_ingredients;

create policy "meal_ingredients_select_own" on public.meal_ingredients
for select to authenticated
using (
  exists (
    select 1 from public.meals m
    where m.id = meal_id and m.user_id = auth.uid()
  )
);

create policy "meal_ingredients_insert_own" on public.meal_ingredients
for insert to authenticated
with check (
  exists (
    select 1 from public.meals m
    where m.id = meal_id and m.user_id = auth.uid()
  )
);

create policy "meal_ingredients_update_own" on public.meal_ingredients
for update to authenticated
using (
  exists (
    select 1 from public.meals m
    where m.id = meal_id and m.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.meals m
    where m.id = meal_id and m.user_id = auth.uid()
  )
);

create policy "meal_ingredients_delete_own" on public.meal_ingredients
for delete to authenticated
using (
  exists (
    select 1 from public.meals m
    where m.id = meal_id and m.user_id = auth.uid()
  )
);

drop policy if exists "daily_entries_select_own" on public.daily_entries;
drop policy if exists "daily_entries_insert_own" on public.daily_entries;
drop policy if exists "daily_entries_update_own" on public.daily_entries;
drop policy if exists "daily_entries_delete_own" on public.daily_entries;

create policy "daily_entries_select_own" on public.daily_entries
for select to authenticated using (auth.uid() = user_id);
create policy "daily_entries_insert_own" on public.daily_entries
for insert to authenticated with check (auth.uid() = user_id);
create policy "daily_entries_update_own" on public.daily_entries
for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "daily_entries_delete_own" on public.daily_entries
for delete to authenticated using (auth.uid() = user_id);
