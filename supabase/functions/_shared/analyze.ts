import type { SupabaseClient } from 'npm:@supabase/supabase-js@2'
import { createUserClient, jsonResponse, requireUserId, sha256Hex } from './http.ts'
import type { AllowedImageMime } from './limits.ts'
import { estimateNutrition, sanitizeEstimate, type NutritionEstimate } from './nutrition.ts'

type Reservation =
  | { kind: 'reserved'; id: string }
  | { kind: 'cached'; result: unknown }
  | { kind: 'denied'; code: 'cooldown' | 'rateLimited' | 'dailyLimit' | 'unauthorized' }

/**
 * Shared pipeline: auth → atomic quota reservation (or cache hit) → provider → complete reservation.
 */
export async function runAnalysis(
  req: Request,
  input: {
    requestType: 'text' | 'photo'
    cacheKey: string
    locale: 'uk' | 'en'
    text?: string
    image?: { base64: string; mimeType: AllowedImageMime }
  },
): Promise<Response> {
  const client = createUserClient(req)

  if (!client || !(await requireUserId(client))) {
    return jsonResponse({ error: 'unauthorized' }, 401)
  }

  const reservation = await reserveAiRequest(
    client,
    input.requestType,
    await sha256Hex(input.cacheKey),
  )

  if (reservation.kind === 'denied') {
    return jsonResponse(
      { error: reservation.code },
      reservation.code === 'unauthorized' ? 401 : 429,
    )
  }

  if (reservation.kind === 'cached') {
    const cached = sanitizeEstimate(reservation.result)
    return cached
      ? jsonResponse({ ...cached, cached: true })
      : jsonResponse({ error: 'invalidAiResult' }, 502)
  }

  const estimate = await estimateNutrition({
    text: input.text,
    image: input.image,
    locale: input.locale,
  })

  await completeAiRequest(client, reservation.id, estimate.ok ? estimate.data : null)

  if (!estimate.ok) {
    return jsonResponse(
      { error: estimate.code },
      estimate.code === 'upstreamLimited' ? 429 : 502,
    )
  }

  return jsonResponse({ ...estimate.data, cached: false })
}

async function reserveAiRequest(
  client: SupabaseClient,
  requestType: 'text' | 'photo',
  inputHash: string,
): Promise<Reservation> {
  const { data, error } = await client.rpc('reserve_ai_request', {
    p_request_type: requestType,
    p_input_hash: inputHash,
  })

  if (error || !data || typeof data !== 'object') {
    console.error('reserve_ai_request failed', error?.message)
    return { kind: 'denied', code: 'rateLimited' }
  }

  const payload = data as { status?: string; id?: string; code?: string; result?: unknown }

  if (payload.status === 'reserved' && payload.id) {
    return { kind: 'reserved', id: payload.id }
  }

  if (payload.status === 'cached') {
    return { kind: 'cached', result: payload.result }
  }

  const code = payload.code
  return {
    kind: 'denied',
    code:
      code === 'cooldown' || code === 'dailyLimit' || code === 'unauthorized'
        ? code
        : 'rateLimited',
  }
}

async function completeAiRequest(
  client: SupabaseClient,
  id: string,
  result: NutritionEstimate | null,
): Promise<void> {
  const { error } = await client.rpc('complete_ai_request', {
    p_id: id,
    p_ok: result !== null,
    p_result: result,
  })

  if (error) {
    console.error('complete_ai_request failed', error.message)
  }
}
