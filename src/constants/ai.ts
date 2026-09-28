/**
 * Edge Function name for text calorie estimates.
 */
export const AI_ANALYZE_TEXT_FN = 'analyze-text'

/**
 * Edge Function name for photo calorie estimates.
 */
export const AI_ANALYZE_PHOTO_FN = 'analyze-photo'

/**
 * Client cooldown between AI analyzes in milliseconds.
 */
export const AI_CLIENT_COOLDOWN_MS = 12_000

/**
 * localStorage key for the last AI request timestamp.
 */
export const AI_CLIENT_COOLDOWN_STORAGE_KEY = 'f-balance.ai.lastRequestAt'

/**
 * Minimum AI text description length.
 */
export const AI_TEXT_MIN_LENGTH = 3

/**
 * Maximum AI text description length.
 */
export const AI_TEXT_MAX_LENGTH = 500

/**
 * Allowed photo MIME types for AI analysis.
 */
export const AI_PHOTO_ALLOWED_MIME = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const

/**
 * Maximum original photo file size before compression (bytes).
 */
export const AI_PHOTO_MAX_INPUT_BYTES = 8 * 1024 * 1024

/**
 * Maximum longest image side after downscale.
 */
export const AI_PHOTO_MAX_DIMENSION = 1280

/**
 * JPEG quality used when compressing photos for AI.
 */
export const AI_PHOTO_JPEG_QUALITY = 0.72

/**
 * Maximum compressed payload size sent to the Edge Function (bytes).
 */
export const AI_PHOTO_MAX_OUTPUT_BYTES = 1_200_000

/**
 * Default meal name when AI estimate has no description.
 */
export const AI_ESTIMATE_DEFAULT_NAME = 'AI estimate'
