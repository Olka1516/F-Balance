-- F-Balance v2 Phase 11: atomic AI quota reservation.
-- Limits: cooldown 3 s, 20 / hour, 60 / day per user. Failed requests do not count.
-- Keep in sync with supabase/functions/_shared/limits.ts and src/constants/ai.ts.

alter table public.ai_requests
  add column if not exists status text not null default 'ok'
    check (status in ('pending', 'ok', 'failed'));

drop policy if exists "ai_requests_insert_own" on public.ai_requests;

create or replace function public.reserve_ai_request(
  p_request_type text,
  p_input_hash text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_now timestamptz := now();
  v_last timestamptz;
  v_hour integer;
  v_day integer;
  v_cached jsonb;
  v_id uuid;
begin
  if v_user is null then
    return jsonb_build_object('status', 'denied', 'code', 'unauthorized');
  end if;

  if p_request_type not in ('text', 'photo') or coalesce(length(p_input_hash), 0) <> 64 then
    return jsonb_build_object('status', 'denied', 'code', 'rateLimited');
  end if;

  perform pg_advisory_xact_lock(hashtextextended(v_user::text, 0));

  select result into v_cached
  from public.ai_requests
  where user_id = v_user
    and input_hash = p_input_hash
    and status = 'ok'
    and result is not null
    and created_at > v_now - interval '48 hours'
  order by created_at desc
  limit 1;

  if v_cached is not null then
    return jsonb_build_object('status', 'cached', 'result', v_cached);
  end if;

  select
    max(created_at),
    count(*) filter (where created_at > v_now - interval '1 hour'),
    count(*)
  into v_last, v_hour, v_day
  from public.ai_requests
  where user_id = v_user
    and created_at > v_now - interval '24 hours'
    and (status = 'ok' or (status = 'pending' and created_at > v_now - interval '2 minutes'));

  if v_last is not null and v_last > v_now - interval '3 seconds' then
    return jsonb_build_object('status', 'denied', 'code', 'cooldown');
  end if;

  if v_day >= 60 then
    return jsonb_build_object('status', 'denied', 'code', 'dailyLimit');
  end if;

  if v_hour >= 20 then
    return jsonb_build_object('status', 'denied', 'code', 'rateLimited');
  end if;

  insert into public.ai_requests (user_id, request_type, input_hash, status)
  values (v_user, p_request_type, p_input_hash, 'pending')
  returning id into v_id;

  return jsonb_build_object('status', 'reserved', 'id', v_id);
end;
$$;

create or replace function public.complete_ai_request(
  p_id uuid,
  p_ok boolean,
  p_result jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.ai_requests
  set
    status = case when p_ok then 'ok' else 'failed' end,
    result = case when p_ok then p_result else null end,
    calories = case when p_ok then nullif(p_result ->> 'calories', '')::numeric else null end
  where id = p_id
    and user_id = auth.uid()
    and status = 'pending';
end;
$$;

revoke all on function public.reserve_ai_request(text, text) from public, anon;
revoke all on function public.complete_ai_request(uuid, boolean, jsonb) from public, anon;
grant execute on function public.reserve_ai_request(text, text) to authenticated;
grant execute on function public.complete_ai_request(uuid, boolean, jsonb) to authenticated;
