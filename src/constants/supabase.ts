/**
 * Supabase connection lifecycle statuses for the frontend client.
 */
export const SUPABASE_CONNECTION_STATUSES = [
  'idle',
  'connecting',
  'connected',
  'degraded',
  'disconnected',
  'unavailable',
] as const

/**
 * Supabase frontend connection status.
 */
export type SupabaseConnectionStatus =
  (typeof SUPABASE_CONNECTION_STATUSES)[number]

/**
 * Initial delay before the first reconnect attempt, in milliseconds.
 */
export const SUPABASE_RECONNECT_BASE_MS = 1000

/**
 * Maximum delay between reconnect attempts, in milliseconds.
 */
export const SUPABASE_RECONNECT_MAX_MS = 30000

/**
 * Maximum automatic reconnect attempts before staying unavailable.
 */
export const SUPABASE_RECONNECT_MAX_ATTEMPTS = 5

/**
 * Health-check timeout for the Supabase client, in milliseconds.
 */
export const SUPABASE_HEALTH_TIMEOUT_MS = 8000
