import type { SupabaseClient } from '@supabase/supabase-js'
import {
  AI_ANALYZE_PHOTO_FN,
  AI_ANALYZE_TEXT_FN,
} from '@/constants/ai'
import {
  getSupabase,
  getSupabaseReadiness,
  isSupabaseConnected,
} from '@/services/supabase'
import type { AiNutritionEstimate, AiServiceErrorCode } from '@/types'
import {
  getAiCooldownRemainingMs,
  markAiRequestNow,
} from '@/utils/aiCooldown'

export type AiActionResult =
  | { ok: true; data: AiNutritionEstimate }
  | { ok: false; code: AiServiceErrorCode }

/**
 * Asks the analyze-text Edge Function for a nutrition estimate.
 */
export async function analyzeFoodText(
  description: string,
): Promise<AiActionResult> {
  if (getAiCooldownRemainingMs() > 0) {
    return { ok: false, code: 'cooldown' }
  }

  return invokeAiFunction(AI_ANALYZE_TEXT_FN, { description })
}

/**
 * Asks the analyze-photo Edge Function for a nutrition estimate.
 */
export async function analyzeFoodPhoto(payload: {
  imageBase64: string
  mimeType: string
}): Promise<AiActionResult> {
  if (getAiCooldownRemainingMs() > 0) {
    return { ok: false, code: 'cooldown' }
  }

  return invokeAiFunction(AI_ANALYZE_PHOTO_FN, payload)
}

async function invokeAiFunction(
  name: string,
  body: Record<string, unknown>,
): Promise<AiActionResult> {
  const readiness = getSupabaseReadiness()

  if (!readiness.ready) {
    return { ok: false, code: mapReadyCode(readiness.code) }
  }

  if (!isSupabaseConnected()) {
    return { ok: false, code: 'unavailable' }
  }

  try {
    const { data, error } = await (getSupabase() as SupabaseClient).functions.invoke(
      name,
      {
        body,
      },
    )

    if (error) {
      return { ok: false, code: mapInvokeError(error, data) }
    }

    const parsed = parseEstimatePayload(data)

    if (!parsed) {
      const code = String((data as { error?: unknown } | null)?.error ?? '')
      return { ok: false, code: mapErrorCode(code) }
    }

    markAiRequestNow()

    return {
      ok: true,
      data: parsed,
    }
  } catch {
    return { ok: false, code: 'unavailable' }
  }
}

function parseEstimatePayload(data: unknown): AiNutritionEstimate | null {
  if (!data || typeof data !== 'object') {
    return null
  }

  const payload = data as Record<string, unknown>
  const calories = Number(payload.calories)

  if (!Number.isFinite(calories) || calories < 0) {
    return null
  }

  return {
    name: optionalString(payload.name),
    calories,
    protein: optionalNumber(payload.protein),
    fat: optionalNumber(payload.fat),
    carbs: optionalNumber(payload.carbs),
    cached: Boolean(payload.cached),
  }
}

function optionalString(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null
  }

  const trimmed = value.trim()
  return trimmed ? trimmed.slice(0, 120) : null
}

function optionalNumber(value: unknown): number | null {
  if (value == null || value === '') {
    return null
  }

  const parsed = Number(value)

  if (!Number.isFinite(parsed) || parsed < 0) {
    return null
  }

  return Math.round(parsed * 100) / 100
}

function mapReadyCode(code: string): AiServiceErrorCode {
  if (code === 'configMissing') {
    return 'misconfigured'
  }

  return 'unavailable'
}

function mapInvokeError(
  error: { message?: string },
  data: unknown,
): AiServiceErrorCode {
  const payloadCode = String((data as { error?: unknown } | null)?.error ?? '')

  if (payloadCode) {
    return mapErrorCode(payloadCode)
  }

  const message = String(error.message ?? '').toLowerCase()

  if (message.includes('429')) {
    return 'rateLimited'
  }

  if (message.includes('401') || message.includes('jwt')) {
    return 'unauthorized'
  }

  return 'unavailable'
}

function mapErrorCode(code: string): AiServiceErrorCode {
  switch (code) {
    case 'unauthorized':
    case 'cooldown':
    case 'rateLimited':
    case 'dailyLimit':
    case 'invalidDescription':
    case 'invalidImage':
    case 'imageTooLarge':
    case 'misconfigured':
    case 'modelUnavailable':
      return code
    case 'upstreamLimited':
      return 'rateLimited'
    case 'upstreamFailed':
    case 'invalidAiResult':
      return 'unavailable'
    default:
      return 'unknown'
  }
}
