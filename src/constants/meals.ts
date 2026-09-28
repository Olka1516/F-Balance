/**
 * Meal slots used when logging food throughout the day.
 */
export const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'] as const

/**
 * Meal slot identifier for saved meals and daily entries.
 */
export type MealType = (typeof MEAL_TYPES)[number]

/**
 * Default meal slot for new manual entries.
 */
export const MEAL_TYPE_DEFAULT: MealType = 'lunch'

/**
 * Manual food source for MVP entries.
 */
export const FOOD_SOURCE_MANUAL = 'manual' as const

/**
 * Minimum grams for a meal amount.
 */
export const MEAL_AMOUNT_MIN_G = 1

/**
 * Maximum grams for a meal amount.
 */
export const MEAL_AMOUNT_MAX_G = 5000

/**
 * Minimum calories for a manual entry.
 */
export const MEAL_CALORIES_MIN = 0

/**
 * Maximum calories for a manual entry.
 */
export const MEAL_CALORIES_MAX = 10000

/**
 * Minimum macro grams for a manual entry.
 */
export const MEAL_MACRO_MIN = 0

/**
 * Maximum macro grams for a manual entry.
 */
export const MEAL_MACRO_MAX = 1000

/**
 * Minimum meal name length.
 */
export const MEAL_NAME_MIN_LENGTH = 1

/**
 * Maximum meal name length.
 */
export const MEAL_NAME_MAX_LENGTH = 120

/**
 * Default servings when logging a meal to today.
 */
export const DAILY_ENTRY_DEFAULT_SERVINGS = 1

/**
 * TanStack Query key root for saved meals.
 */
export const MEALS_QUERY_KEY = ['meals'] as const

/**
 * TanStack Query key root for daily entries.
 */
export const DAILY_ENTRIES_QUERY_KEY = ['daily-entries'] as const
