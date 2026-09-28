-- Add optional daily macro targets (grams) to user profiles.

alter table public.user_profiles
  add column if not exists daily_protein numeric(8, 2)
    check (daily_protein is null or (daily_protein >= 0 and daily_protein <= 500));

alter table public.user_profiles
  add column if not exists daily_fat numeric(8, 2)
    check (daily_fat is null or (daily_fat >= 0 and daily_fat <= 500));

alter table public.user_profiles
  add column if not exists daily_carbs numeric(8, 2)
    check (daily_carbs is null or (daily_carbs >= 0 and daily_carbs <= 800));
