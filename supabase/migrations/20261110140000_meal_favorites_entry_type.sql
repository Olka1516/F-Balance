-- F-Balance v2 Phase 15: favourite meals and per-entry meal slot.

alter table public.meals
  add column if not exists is_favorite boolean not null default false;

alter table public.daily_entries
  add column if not exists meal_type text
    check (meal_type is null or meal_type in ('breakfast', 'lunch', 'dinner', 'snack'));

drop policy if exists "daily_entries_update_own" on public.daily_entries;

create policy "daily_entries_update_own"
on public.daily_entries
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
