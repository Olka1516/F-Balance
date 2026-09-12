export {
  createSupabaseClient,
  hasSupabaseConfig,
  readSupabaseEnv,
} from '@/services/supabase/client'
export {
  connectSupabase,
  disconnectSupabase,
  getSupabase,
  getSupabaseConnectionStatus,
  getSupabaseLastErrorCode,
  getSupabaseReadiness,
  isSupabaseConnected,
  reconnectSupabase,
  scheduleSupabaseReconnect,
} from '@/services/supabase/connection'
export {
  createSupabaseFailure,
  mapSupabaseErrorCode,
  SUPABASE_ERROR_CODES,
  type SupabaseErrorCode,
} from '@/services/supabase/errors'
export {
  createStubAuthError,
  createStubAuthFailure,
  createSupabaseStub,
  type SupabaseStubClient,
} from '@/services/supabase/stub'
