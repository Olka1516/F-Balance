-- F-Balance v2 Phase 12: inputs for calculated calorie and macro targets.

alter table public.user_profiles
  add column if not exists sex text
    check (sex is null or sex in ('female', 'male'));

alter table public.user_profiles
  add column if not exists target_weight numeric(6, 2)
    check (target_weight is null or (target_weight >= 20 and target_weight <= 400));

alter table public.user_profiles
  add column if not exists pace text
    check (pace is null or pace in ('slow', 'normal', 'fast'));
