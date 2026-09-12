/**
 * Stable error codes for Supabase client and connection failures.
 */
export const SUPABASE_ERROR_CODES = {
  configMissing: 'configMissing',
  connectionFailed: 'connectionFailed',
  unavailable: 'unavailable',
  disconnected: 'disconnected',
  timeout: 'timeout',
  unknown: 'unknown',
} as const

/**
 * Supabase connection or client error code.
 */
export type SupabaseErrorCode =
  (typeof SUPABASE_ERROR_CODES)[keyof typeof SUPABASE_ERROR_CODES]

/**
 * Maps an unknown failure into a stable Supabase error code.
 */
export function mapSupabaseErrorCode(error: unknown): SupabaseErrorCode {
  if (!error) {
    return SUPABASE_ERROR_CODES.unknown
  }

  if (typeof error === 'string') {
    return mapMessageToCode(error)
  }

  if (error instanceof Error) {
    return mapMessageToCode(error.message)
  }

  if (typeof error === 'object' && 'message' in error) {
    return mapMessageToCode(String((error as { message: unknown }).message))
  }

  return SUPABASE_ERROR_CODES.unknown
}

/**
 * Builds a user-safe error result for Supabase operations.
 */
export function createSupabaseFailure(code: SupabaseErrorCode): {
  ok: false
  code: SupabaseErrorCode
} {
  return { ok: false, code }
}

function mapMessageToCode(message: string): SupabaseErrorCode {
  const normalized = message.toLowerCase()

  if (
    normalized.includes('vite_supabase') ||
    normalized.includes('missing') ||
    normalized.includes('config')
  ) {
    return SUPABASE_ERROR_CODES.configMissing
  }

  if (normalized.includes('timeout') || normalized.includes('timed out')) {
    return SUPABASE_ERROR_CODES.timeout
  }

  if (
    normalized.includes('failed to fetch') ||
    normalized.includes('network') ||
    normalized.includes('connection')
  ) {
    return SUPABASE_ERROR_CODES.connectionFailed
  }

  if (normalized.includes('unavailable') || normalized.includes('stub')) {
    return SUPABASE_ERROR_CODES.unavailable
  }

  if (normalized.includes('disconnect')) {
    return SUPABASE_ERROR_CODES.disconnected
  }

  return SUPABASE_ERROR_CODES.unknown
}
