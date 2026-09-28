import type { MealType } from '@/constants/meals'

/**
 * Logged meal portion for a specific calendar day.
 */
export type DailyEntry = {
  id: string
  userId: string
  mealId: string
  date: string
  amount: number
  createdAt: string
}

/**
 * Meal fields needed to render a daily diary row.
 */
export type DailyEntryMealSummary = {
  id: string
  name: string
  mealType: MealType
  calories: number
  protein: number
  fat: number
  carbs: number
  totalWeight: number
}

/**
 * Daily entry with meal nutrition for dashboard totals.
 */
export type DailyEntryWithMeal = DailyEntry & {
  meal: DailyEntryMealSummary
}
