import type { MealType } from '@/constants/meals'
import type { UserGoal } from '@/types'

/**
 * TheMealDB category names used by the free API.
 */
export type TheMealDbCategory =
  | 'Breakfast'
  | 'Chicken'
  | 'Beef'
  | 'Seafood'
  | 'Vegetarian'
  | 'Vegan'
  | 'Pasta'
  | 'Side'
  | 'Starter'
  | 'Dessert'
  | 'Pork'
  | 'Lamb'
  | 'Miscellaneous'

/**
 * Categories fetched per meal slot.
 */
export const THEMEALDB_CATEGORIES_BY_MEAL_TYPE = {
  breakfast: ['Breakfast'],
  lunch: ['Chicken', 'Seafood', 'Vegetarian', 'Pasta'],
  dinner: ['Beef', 'Chicken', 'Lamb', 'Seafood', 'Pasta'],
  snack: ['Side', 'Starter', 'Vegetarian'],
} as const satisfies Record<MealType, readonly TheMealDbCategory[]>

/**
 * Approximate kcal guidance by TheMealDB category (not measured nutrition).
 */
export const THEMEALDB_CATEGORY_APPROX_KCAL = {
  Breakfast: 350,
  Chicken: 450,
  Beef: 550,
  Seafood: 400,
  Vegetarian: 380,
  Vegan: 350,
  Pasta: 500,
  Side: 200,
  Starter: 250,
  Dessert: 320,
  Pork: 500,
  Lamb: 550,
  Miscellaneous: 400,
} as const satisfies Record<TheMealDbCategory, number>

/**
 * Preferred categories when scoring by user goal.
 */
export const THEMEALDB_PREFERRED_CATEGORIES_BY_GOAL = {
  lose: ['Side', 'Starter', 'Seafood', 'Vegetarian', 'Vegan', 'Breakfast'],
  maintain: ['Chicken', 'Seafood', 'Vegetarian', 'Breakfast', 'Pasta', 'Side'],
  gain: ['Beef', 'Pasta', 'Chicken', 'Lamb', 'Pork', 'Breakfast'],
} as const satisfies Record<UserGoal, readonly TheMealDbCategory[]>

/**
 * Categories deprioritized for a weight-loss goal.
 */
export const THEMEALDB_AVOID_CATEGORIES_FOR_LOSE = [
  'Dessert',
  'Beef',
  'Lamb',
  'Pork',
] as const satisfies readonly TheMealDbCategory[]

/**
 * How many recipe recommendations to show.
 */
export const RECOMMENDATIONS_COUNT = 4

/**
 * Remaining kcal below which only lighter snack-style ideas are preferred.
 */
export const RECOMMENDATIONS_LOW_REMAINING_KCAL = 250

/**
 * Soft remaining-kcal multiplier before a recipe is treated as too heavy.
 */
export const RECOMMENDATIONS_REMAINING_HEADROOM = 1.15

/**
 * Hour ranges (local) that map clock time to a default meal slot.
 */
export const RECOMMENDATIONS_TIME_WINDOWS = [
  { startHour: 5, endHour: 10, mealType: 'breakfast' },
  { startHour: 10, endHour: 14, mealType: 'lunch' },
  { startHour: 14, endHour: 17, mealType: 'snack' },
  { startHour: 17, endHour: 22, mealType: 'dinner' },
] as const satisfies readonly {
  startHour: number
  endHour: number
  mealType: MealType
}[]

/**
 * Fallback meal slot outside defined time windows.
 */
export const RECOMMENDATIONS_DEFAULT_MEAL_TYPE: MealType = 'snack'

/**
 * Approximate cook-time bounds in minutes for recipe heuristics.
 */
export const RECOMMENDATIONS_COOK_MINUTES_MIN = 10
export const RECOMMENDATIONS_COOK_MINUTES_MAX = 90
