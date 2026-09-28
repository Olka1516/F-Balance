import { createClient, type SupabaseClient } from 'npm:@supabase/supabase-js@2'

export type RateLimitDecision =
  | { ok: true; cachedCalories: number | null }
  | { ok: false; code: 'unauthorized' | 'cooldown' | 'rateLimited' | 'dailyLimit' }

const COOLDOWN_MS = 12_000
const MAX_PER_HOUR = 10
const MAX_PER_DAY = 40
const CACHE_TTL_MS = 24 * 60 * 60 * 1000

/**
 * Creates a user-scoped Supabase client from the request Authorization header.
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
 * Resolves the authenticated user id for the request.
 */
export async function requireUserId(
  client: SupabaseClient,
): Promise<string | null> {
  const { data, error } = await client.auth.getUser()

  if (error || !data.user) {
    return null
  }

  return data.user.id
}

/**
 * Checks cooldown, hourly/daily caps, and returns a cached calorie estimate when fresh.
 */
export async function checkAiRateLimit(
  client: SupabaseClient,
  userId: string,
  inputHash: string,
): Promise<RateLimitDecision> {
  const now = Date.now()
  const dayAgo = new Date(now - 24 * 60 * 60 * 1000).toISOString()
  const hourAgo = new Date(now - 60 * 60 * 1000).toISOString()

  const { data: recent, error } = await client
    .from('ai_requests')
    .select('calories, input_hash, created_at')
    .eq('user_id', userId)
    .gte('created_at', dayAgo)
    .order('created_at', { ascending: false })
    .limit(MAX_PER_DAY + 5)

  if (error) {
    return { ok: false, code: 'rateLimited' }
  }

  const rows = recent ?? []

  if (rows.length >= MAX_PER_DAY) {
    return { ok: false, code: 'dailyLimit' }
  }

  const hourCount = rows.filter(
    (row) => new Date(row.created_at).getTime() >= new Date(hourAgo).getTime(),
  ).length

  if (hourCount >= MAX_PER_HOUR) {
    return { ok: false, code: 'rateLimited' }
  }

  const latest = rows[0]

  if (latest) {
    const elapsed = now - new Date(latest.created_at).getTime()

    if (elapsed < COOLDOWN_MS) {
      return { ok: false, code: 'cooldown' }
    }
  }

  const cached = rows.find(
    (row) =>
      row.input_hash === inputHash &&
      row.calories != null &&
      now - new Date(row.created_at).getTime() <= CACHE_TTL_MS,
  )

  if (cached?.calories != null) {
    return { ok: true, cachedCalories: Number(cached.calories) }
  }

  return { ok: true, cachedCalories: null }
}

/**
 * Stores an AI request row for auditing and rate limits.
 */
export async function logAiRequest(
  client: SupabaseClient,
  userId: string,
  requestType: 'text' | 'photo',
  inputHash: string,
  calories: number,
): Promise<void> {
  await client.from('ai_requests').insert({
    user_id: userId,
    request_type: requestType,
    input_hash: inputHash,
    calories,
  })
}

/**
 * SHA-256 hex digest for cache keys.
 */
export async function sha256Hex(value: string): Promise<string> {
  const data = new TextEncoder().encode(value)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}
