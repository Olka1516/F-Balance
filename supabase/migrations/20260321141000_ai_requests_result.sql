-- Phase 8+: store structured AI nutrition estimates for cache reuse
alter table public.ai_requests
  add column if not exists result jsonb;
