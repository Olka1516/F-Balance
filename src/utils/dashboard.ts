import type { MealType } from '@/constants/meals'
import type { DailyEntryWithMeal } from '@/types'
import {
  remainingCalories,
  roundNutrition,
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

/**
 * One day on the weekly calories chart.
 */
export type DashboardWeekDayPoint = {
  date: string
  calories: number
}

/**
 * Builds inclusive local calendar dates ending at `endDate` (YYYY-MM-DD).
 */
export function listRecentLocalDates(
  dayCount: number,
  endDate = new Date(),
): string[] {
  const dates: string[] = []

  for (let offset = dayCount - 1; offset >= 0; offset -= 1) {
    const day = new Date(
      endDate.getFullYear(),
      endDate.getMonth(),
      endDate.getDate() - offset,
    )
    const year = day.getFullYear()
    const month = String(day.getMonth() + 1).padStart(2, '0')
    const date = String(day.getDate()).padStart(2, '0')
    dates.push(`${year}-${month}-${date}`)
  }

  return dates
}

/**
 * Aggregates diary entries into daily calorie totals for the week chart.
 */
export function buildWeekCaloriePoints(
  entries: DailyEntryWithMeal[],
  dates: readonly string[],
): DashboardWeekDayPoint[] {
  const byDate = new Map<string, number>()

  for (const date of dates) {
    byDate.set(date, 0)
  }

  for (const entry of entries) {
    if (!byDate.has(entry.date)) {
      continue
    }

    const portion = entryPortionMacros(entry)
    byDate.set(
      entry.date,
      roundNutrition((byDate.get(entry.date) ?? 0) + portion.calories),
    )
  }

  return dates.map((date) => ({
    date,
    calories: byDate.get(date) ?? 0,
  }))
}
