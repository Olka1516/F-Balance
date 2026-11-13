import { DAYS_PER_WEEK, type ProgressPeriod } from '@/constants/dashboard'
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
      mealType: entry.mealType ?? entry.meal.mealType,
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
 * Parses a YYYY-MM-DD key into a local Date at midnight.
 */
export function parseLocalDateKey(dateKey: string): Date {
  const [year, month, day] = dateKey.split('-').map(Number)

  return new Date(year ?? 0, (month ?? 1) - 1, day ?? 1)
}

/**
 * Formats a local Date as YYYY-MM-DD.
 */
export function formatLocalDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
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
    dates.push(formatLocalDateKey(day))
  }

  return dates
}

/**
 * Shifts a YYYY-MM-DD key by a number of calendar days.
 */
export function shiftLocalDateKey(dateKey: string, dayDelta: number): string {
  const date = parseLocalDateKey(dateKey)

  date.setDate(date.getDate() + dayDelta)

  return formatLocalDateKey(date)
}

/**
 * Averages and adherence for the Progress screen over the given dates.
 * Averages use only days that have at least one entry.
 */
export type ProgressStats = {
  loggedDays: number
  totalDays: number
  daysOnTarget: number
  average: MacroTotals
}

/**
 * Averages macros over logged days and counts days within the calorie target.
 */
export function buildProgressStats(days: readonly ProgressDay[]): ProgressStats {
  const logged = days.filter((day) => day.status !== 'empty')
  const sum = sumMacros(logged.map((day) => day.totals))
  const average = (value: number) => (logged.length ? Math.round(value / logged.length) : 0)

  return {
    loggedDays: logged.length,
    totalDays: days.length,
    daysOnTarget: logged.filter((day) => day.status === 'onTarget').length,
    average: {
      calories: average(sum.calories),
      protein: average(sum.protein),
      fat: average(sum.fat),
      carbs: average(sum.carbs),
    },
  }
}

/**
 * How a logged day compares with the calorie target.
 */
export type ProgressDayStatus = 'empty' | 'onTarget' | 'off'

/**
 * One calendar day on the Progress screen.
 */
export type ProgressDay = {
  date: string
  totals: MacroTotals
  status: ProgressDayStatus
}

/**
 * Lists the local calendar dates of a Monday–Sunday week or a calendar month,
 * `offset` periods away from the one containing `today`.
 */
export function listPeriodLocalDates(
  period: ProgressPeriod,
  offset: number,
  today = new Date(),
): string[] {
  if (period === 'month') {
    const first = new Date(today.getFullYear(), today.getMonth() + offset, 1)
    const daysInMonth = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate()
    const last = new Date(first.getFullYear(), first.getMonth(), daysInMonth)

    return listRecentLocalDates(daysInMonth, last)
  }

  const weekday = today.getDay()
  const mondayOffset = weekday === 0 ? 1 - DAYS_PER_WEEK : 1 - weekday
  const sunday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() + mondayOffset + DAYS_PER_WEEK - 1 + offset * DAYS_PER_WEEK,
  )

  return listRecentLocalDates(DAYS_PER_WEEK, sunday)
}

/**
 * Builds per-day totals and target status for the Progress screen.
 */
export function buildProgressDays(
  entries: DailyEntryWithMeal[],
  dates: readonly string[],
  targetCalories: number | null,
  tolerance: number,
): ProgressDay[] {
  const byDate = new Map<string, MacroTotals>()

  for (const entry of entries) {
    if (!dates.includes(entry.date)) {
      continue
    }

    const portion = entryPortionMacros(entry)
    const current = byDate.get(entry.date) ?? { calories: 0, protein: 0, fat: 0, carbs: 0 }
    byDate.set(entry.date, {
      calories: current.calories + portion.calories,
      protein: current.protein + portion.protein,
      fat: current.fat + portion.fat,
      carbs: current.carbs + portion.carbs,
    })
  }

  return dates.map((date) => {
    const totals = byDate.get(date)

    if (!totals) {
      return { date, totals: { calories: 0, protein: 0, fat: 0, carbs: 0 }, status: 'empty' }
    }

    const onTarget =
      targetCalories != null &&
      Math.abs(totals.calories - targetCalories) <= targetCalories * tolerance

    return { date, totals, status: onTarget ? 'onTarget' : 'off' }
  })
}
