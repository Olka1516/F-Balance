/**
 * Single source of truth for AI payload bounds and provider settings.
 * Per-user rate limits are enforced in SQL (reserve_ai_request) — see migration 20261110120000.
 */
export const AI_LIMITS = {
  textMin: 3,
  textMax: 500,
  clarificationMax: 200,
  photoMaxBase64Chars: 1_100_000,
  photoAllowedMime: ['image/jpeg', 'image/png', 'image/webp'] as const,
  providerTimeoutMs: 30_000,
  maxOutputTokens: 1_024,
} as const

/**
 * Image MIME types accepted for photo analysis.
 */
export type AllowedImageMime = (typeof AI_LIMITS.photoAllowedMime)[number]

/**
 * Default Gemini model for nutrition estimates; override with the GEMINI_MODEL secret.
 */
export const DEFAULT_AI_MODEL = 'gemini-flash-lite-latest'
