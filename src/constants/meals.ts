/**
 * Meal slots used when logging food throughout the day.
 */
export const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'] as const

/**
 * Meal slot identifier for saved meals and daily entries.
 */
export type MealType = (typeof MEAL_TYPES)[number]
