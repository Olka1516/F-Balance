import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/**
 * Reads Supabase URL and browser key from the Vite environment.
 */
export function readSupabaseEnv(): { url: string; anonKey: string } | null {
  const url = import.meta.env.VITE_SUPABASE_URL
  const anonKey =
    import.meta.env.VITE_SUPABASE_ANON_KEY ||
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

  if (!url || !anonKey) {
    return null
  }

  return { url, anonKey }
}

/**
 * Whether Supabase env vars are present for client creation.
 */
export function hasSupabaseConfig(): boolean {
  return readSupabaseEnv() !== null
}

/**
 * Creates a real browser Supabase client with the anon/publishable key only.
 */
export function createSupabaseClient(): SupabaseClient {
  const env = readSupabaseEnv()

  if (!env) {
    throw new Error(
      'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY / VITE_SUPABASE_PUBLISHABLE_KEY',
    )
  }

  return createClient(env.url, env.anonKey)
}
