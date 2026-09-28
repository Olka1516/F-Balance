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
 * Maximum allowed daily protein target in grams.
 */
export const PROFILE_DAILY_PROTEIN_MAX_G = 500

/**
 * Maximum allowed daily fat target in grams.
 */
export const PROFILE_DAILY_FAT_MAX_G = 500

/**
 * Maximum allowed daily carbs target in grams.
 */
export const PROFILE_DAILY_CARBS_MAX_G = 800

/**
 * Minimum allowed daily macro target in grams.
 */
export const PROFILE_DAILY_MACRO_MIN_G = 0

/**
 * Default macro calorie shares by goal (protein / fat / carbs).
 * Guidance only — not medical advice.
 */
export const MACRO_SPLIT_BY_GOAL = {
  lose: { protein: 0.3, fat: 0.3, carbs: 0.4 },
  maintain: { protein: 0.25, fat: 0.3, carbs: 0.45 },
  gain: { protein: 0.25, fat: 0.25, carbs: 0.5 },
  default: { protein: 0.25, fat: 0.3, carbs: 0.45 },
} as const

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
