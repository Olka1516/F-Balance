/**
 * Private Storage bucket for optional user meal photos (not used by AI analysis).
 */
export const STORAGE_MEAL_PHOTOS_BUCKET = 'meal-photos'

/**
 * Maximum meal photo size allowed in Storage (bytes).
 */
export const STORAGE_MEAL_PHOTO_MAX_BYTES = 1 * 1024 * 1024

/**
 * MIME types accepted for meal photos in Storage.
 */
export const STORAGE_MEAL_PHOTO_ALLOWED_MIME = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const
