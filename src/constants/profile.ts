import type { ActivityLevel, UserGoal } from '@/types'

/**
 * Profile goal options collected during onboarding.
 */
export const USER_GOALS = ['lose', 'maintain', 'gain'] as const satisfies readonly UserGoal[]

/**
 * Activity level options for calorie context.
 */
export const ACTIVITY_LEVELS = [
  'sedentary',
  'light',
  'moderate',
  'active',
  'very_active',
] as const satisfies readonly ActivityLevel[]

/**
 * Minimum allowed weight in kilograms.
 */
export const PROFILE_WEIGHT_MIN_KG = 20

/**
 * Maximum allowed weight in kilograms.
 */
export const PROFILE_WEIGHT_MAX_KG = 400

/**
 * Minimum allowed height in centimeters.
 */
export const PROFILE_HEIGHT_MIN_CM = 80

/**
 * Maximum allowed height in centimeters.
 */
export const PROFILE_HEIGHT_MAX_CM = 280

/**
 * Minimum allowed age in years.
 */
export const PROFILE_AGE_MIN = 10

/**
 * Maximum allowed age in years.
 */
export const PROFILE_AGE_MAX = 120

/**
 * Minimum allowed daily calorie target.
 */
export const PROFILE_DAILY_CALORIES_MIN = 800

/**
 * Maximum allowed daily calorie target.
 */
export const PROFILE_DAILY_CALORIES_MAX = 8000

/**
 * TanStack Query key for the current user profile.
 */
export const PROFILE_QUERY_KEY = ['profile'] as const

/**
 * Visual layouts for the shared profile form.
 */
export const PROFILE_FORM_VARIANTS = ['default', 'onboarding'] as const

/**
 * Profile form visual layout variant.
 */
export type ProfileFormVariant = (typeof PROFILE_FORM_VARIANTS)[number]

/**
 * Named profile form layout shortcuts.
 */
export const PROFILE_FORM_VARIANT = {
  default: 'default',
  onboarding: 'onboarding',
} as const satisfies Record<string, ProfileFormVariant>

/**
 * Default profile form layout.
 */
export const PROFILE_FORM_DEFAULT_VARIANT: ProfileFormVariant =
  PROFILE_FORM_VARIANT.default
