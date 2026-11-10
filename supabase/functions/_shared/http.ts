import { createClient, type SupabaseClient } from 'npm:@supabase/supabase-js@2'

/**
 * Shared CORS headers for AI Edge Functions.
 */
export const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, prefer, accept, accept-profile, content-profile, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
}

/**
 * JSON response with CORS headers.
 */
export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

/**
 * Creates a Supabase client that acts as the calling user, so RLS applies.
 */
export function createUserClient(req: Request): SupabaseClient | null {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')
  const authHeader = req.headers.get('Authorization')

  if (!supabaseUrl || !anonKey || !authHeader) {
    return null
  }

  return createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  })
}

/**
 * Returns the authenticated user id or null.
 */
export async function requireUserId(client: SupabaseClient): Promise<string | null> {
  const { data, error } = await client.auth.getUser()
  return error || !data.user ? null : data.user.id
}

/**
 * Normalizes the requested locale to a supported one.
 */
export function normalizeLocale(value: unknown): 'uk' | 'en' {
  return String(value ?? '').trim().toLowerCase() === 'en' ? 'en' : 'uk'
}

/**
 * SHA-256 hex digest used as the cache key.
 */
export async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}
