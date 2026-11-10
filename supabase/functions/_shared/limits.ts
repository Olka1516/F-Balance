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
  providerMaxRetries: 1,
  maxOutputTokens: 4_000,
} as const

/**
 * Image MIME types accepted for photo analysis.
 */
export type AllowedImageMime = (typeof AI_LIMITS.photoAllowedMime)[number]

/**
 * Default Claude model for nutrition estimates; override with the ANTHROPIC_MODEL secret.
 */
export const DEFAULT_AI_MODEL = 'claude-haiku-5-5'
