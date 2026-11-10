import type { ActivityLevel, BiologicalSex, GoalPace, UserGoal } from '@/types'

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
 * Biological sex options used by the BMR formula.
 */
export const BIOLOGICAL_SEXES = ['female', 'male'] as const satisfies readonly BiologicalSex[]

/**
 * Goal pace options (how fast to change weight).
 */
export const GOAL_PACES = ['slow', 'normal', 'fast'] as const satisfies readonly GoalPace[]

/**
 * Pace used when the goal changes weight but no pace is chosen yet.
 */
export const DEFAULT_GOAL_PACE: GoalPace = 'normal'

/**
 * Mifflin–St Jeor constant by sex, in kcal.
 */
export const MIFFLIN_SEX_OFFSET = {
  female: -161,
  male: 5,
} as const satisfies Record<BiologicalSex, number>

/**
 * Activity multipliers applied to BMR to get maintenance calories.
 */
export const ACTIVITY_FACTORS = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
} as const satisfies Record<ActivityLevel, number>

/**
 * Calorie change from maintenance by goal and pace, in percent.
 */
export const GOAL_PACE_ADJUSTMENT = {
  lose: { slow: -10, normal: -15, fast: -20 },
  gain: { slow: 5, normal: 10, fast: 15 },
} as const satisfies Record<Exclude<UserGoal, 'maintain'>, Record<GoalPace, number>>

/**
 * Lowest suggested daily calories by sex; the target never goes below BMR either.
 */
export const CALORIE_FLOOR_BY_SEX = {
  female: 1200,
  male: 1500,
} as const satisfies Record<BiologicalSex, number>

/**
 * Protein target per kilogram of body weight by goal.
 */
export const PROTEIN_G_PER_KG_BY_GOAL = {
  lose: 2,
  maintain: 1.6,
  gain: 1.8,
} as const satisfies Record<UserGoal, number>

/**
 * Minimum fat per kilogram of body weight.
 */
export const FAT_G_PER_KG_MIN = 0.8

/**
 * Minimum share of daily calories from fat.
 */
export const FAT_SHARE_MIN = 0.25

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
