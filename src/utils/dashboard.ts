import type { MealType } from '@/constants/meals'
import type { DailyEntryWithMeal } from '@/types'
import {
  remainingCalories,
  scaleMacros,
  sumMacros,
  type MacroTotals,
} from '@/utils/macros'

/**
 * One diary meal after applying the logged servings factor.
 */
export type DashboardMealItem = {
  entryId: string
  mealId: string
  name: string
  mealType: MealType
  servings: number
  calories: number
  protein: number
  fat: number
  carbs: number
}

/**
 * Meals grouped under one daily slot (breakfast, lunch, …).
 */
export type DashboardMealGroup = {
  mealType: MealType
  items: DashboardMealItem[]
  totals: MacroTotals
}

/**
 * Aggregated day progress for the dashboard.
 */
export type DashboardDaySummary = {
  targetCalories: number | null
  consumed: MacroTotals
  remaining: number | null
  groups: DashboardMealGroup[]
  entryCount: number
}

/**
 * Builds portion macros for one daily entry.
 */
export function entryPortionMacros(entry: DailyEntryWithMeal): MacroTotals {
  return scaleMacros(
    {
      calories: entry.meal.calories,
      protein: entry.meal.protein,
      fat: entry.meal.fat,
      carbs: entry.meal.carbs,
    },
    entry.amount,
  )
}

/**
 * Aggregates today's diary into totals and meal-type groups.
 */
export function buildDashboardDaySummary(
  entries: DailyEntryWithMeal[],
  mealTypes: readonly MealType[],
  targetCalories: number | null,
): DashboardDaySummary {
  const items: DashboardMealItem[] = entries.map((entry) => {
    const portion = entryPortionMacros(entry)

    return {
      entryId: entry.id,
      mealId: entry.mealId,
      name: entry.meal.name,
      mealType: entry.meal.mealType,
      servings: entry.amount,
      calories: portion.calories,
      protein: portion.protein,
      fat: portion.fat,
      carbs: portion.carbs,
    }
  })

  const consumed = sumMacros(
    items.map((item) => ({
      calories: item.calories,
      protein: item.protein,
      fat: item.fat,
      carbs: item.carbs,
    })),
  )

  const groups = mealTypes.map((mealType) => {
    const groupItems = items.filter((item) => item.mealType === mealType)

    return {
      mealType,
      items: groupItems,
      totals: sumMacros(
        groupItems.map((item) => ({
          calories: item.calories,
          protein: item.protein,
          fat: item.fat,
          carbs: item.carbs,
        })),
      ),
    }
  })

  return {
    targetCalories,
    consumed,
    remaining:
      targetCalories == null
        ? null
        : remainingCalories(targetCalories, consumed.calories),
    groups,
    entryCount: items.length,
  }
}
