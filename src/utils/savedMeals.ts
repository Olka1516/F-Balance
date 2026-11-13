import {
  MEAL_TIME_DEFAULT,
  MEAL_TIME_WINDOWS,
  type MealType,
  type SavedMealFilter,
  type SavedMealSort,
} from '@/constants/meals'
import type { DailyEntryWithMeal, MealWithIngredients } from '@/types'

/**
 * Default meal slot for a local clock hour.
 */
export function resolveMealTypeFromHour(hour: number): MealType {
  const window = MEAL_TIME_WINDOWS.find(
    (entry) => hour >= entry.startHour && hour < entry.endHour,
  )

  return window?.mealType ?? MEAL_TIME_DEFAULT
}

/**
 * Saved meals ordered by when they were last logged (most recent first).
 */
export function buildRecentMeals(
  meals: MealWithIngredients[],
  entries: DailyEntryWithMeal[],
): MealWithIngredients[] {
  const byId = new Map(meals.map((meal) => [meal.id, meal]))
  const seen = new Set<string>()
  const recent: MealWithIngredients[] = []

  for (const entry of [...entries].sort((a, b) => b.createdAt.localeCompare(a.createdAt))) {
    const meal = byId.get(entry.mealId)

    if (meal && !seen.has(meal.id)) {
      seen.add(meal.id)
      recent.push(meal)
    }
  }

  return recent
}

/**
 * Picks saved meals that fit the remaining calories for the "What to eat next" card.
 * Prefers the current meal slot and favourites, skips meals already eaten today,
 * and rotates by day so the ideas are not identical every day.
 */
export function suggestNextMeals(input: {
  meals: MealWithIngredients[]
  todayMealIds: ReadonlySet<string>
  remainingCalories: number | null
  mealType: MealType
  dayKey: string
  count: number
  headroom: number
}): MealWithIngredients[] {
  const limit = input.remainingCalories == null ? Infinity : input.remainingCalories * input.headroom

  if (limit <= 0) {
    return []
  }

  const daySeed = [...input.dayKey].reduce((sum, char) => sum + char.charCodeAt(0), 0)
  const score = (meal: MealWithIngredients) =>
    (meal.mealType === input.mealType ? 4 : 0) +
    (meal.isFavorite ? 2 : 0) +
    (((daySeed + meal.id.charCodeAt(0) + meal.id.charCodeAt(meal.id.length - 1)) % 7) / 7)

  return input.meals
    .filter((meal) => !input.todayMealIds.has(meal.id) && meal.calories > 0 && meal.calories <= limit)
    .sort((a, b) => score(b) - score(a))
    .slice(0, input.count)
}

/**
 * Filters saved meals by favourites and a case-insensitive name query,
 * then orders them for the My meals list.
 */
export function arrangeSavedMeals(input: {
  meals: MealWithIngredients[]
  recent: MealWithIngredients[]
  query: string
  filter: SavedMealFilter
  sort: SavedMealSort
}): MealWithIngredients[] {
  const needle = input.query.trim().toLocaleLowerCase()
  const matches = input.meals.filter(
    (meal) =>
      (input.filter === 'all' || meal.isFavorite) &&
      (!needle || meal.name.toLocaleLowerCase().includes(needle)),
  )

  if (input.sort === 'calories') {
    return [...matches].sort((a, b) => a.calories - b.calories)
  }

  const byNewest = [...matches].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))

  if (input.sort === 'newest') {
    return byNewest
  }

  const rank = new Map(input.recent.map((meal, index) => [meal.id, index]))

  return byNewest.sort(
    (a, b) => (rank.get(a.id) ?? Number.MAX_SAFE_INTEGER) - (rank.get(b.id) ?? Number.MAX_SAFE_INTEGER),
  )
}
