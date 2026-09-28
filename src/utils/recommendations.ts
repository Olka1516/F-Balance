import {
  RECOMMENDATIONS_COOK_MINUTES_MAX,
  RECOMMENDATIONS_COOK_MINUTES_MIN,
  RECOMMENDATIONS_COUNT,
  RECOMMENDATIONS_DEFAULT_MEAL_TYPE,
  RECOMMENDATIONS_LOW_REMAINING_KCAL,
  RECOMMENDATIONS_REMAINING_HEADROOM,
  RECOMMENDATIONS_TIME_WINDOWS,
  THEMEALDB_AVOID_CATEGORIES_FOR_LOSE,
  THEMEALDB_CATEGORIES_BY_MEAL_TYPE,
  THEMEALDB_CATEGORY_APPROX_KCAL,
  THEMEALDB_PREFERRED_CATEGORIES_BY_GOAL,
  type TheMealDbCategory,
} from '@/constants/recommendations'
import type { MealType } from '@/constants/meals'
import type {
  RecommendationContext,
  RecipeDetail,
  RecipeRecommendation,
  RecipeSummary,
} from '@/types'

/**
 * Picks the default meal slot from the local clock hour.
 */
export function resolveMealTypeFromHour(hour: number): MealType {
  const window = RECOMMENDATIONS_TIME_WINDOWS.find(
    (entry) => hour >= entry.startHour && hour < entry.endHour,
  )

  return window?.mealType ?? RECOMMENDATIONS_DEFAULT_MEAL_TYPE
}

/**
 * Categories to request from TheMealDB for one meal slot.
 */
export function categoriesForMealType(
  mealType: MealType,
): readonly TheMealDbCategory[] {
  return THEMEALDB_CATEGORIES_BY_MEAL_TYPE[mealType]
}

/**
 * Approximate kcal for a TheMealDB category (guidance only).
 */
export function approxCaloriesForCategory(category: string): number {
  if (category in THEMEALDB_CATEGORY_APPROX_KCAL) {
    return THEMEALDB_CATEGORY_APPROX_KCAL[category as TheMealDbCategory]
  }

  return THEMEALDB_CATEGORY_APPROX_KCAL.Miscellaneous
}

/**
 * Builds a short blurb from recipe instructions.
 */
export function buildRecipeShortDescription(
  instructions: string,
  maxLength = 140,
): string {
  const firstLine =
    instructions
      .split(/\n+/)
      .map((line) => line.trim())
      .find(Boolean) ?? instructions.trim()

  if (firstLine.length <= maxLength) {
    return firstLine
  }

  return `${firstLine.slice(0, maxLength - 1).trimEnd()}…`
}

/**
 * Estimates cook minutes from ingredients and instruction length.
 */
export function estimateCookMinutes(
  ingredientCount: number,
  instructionLength: number,
): number {
  const raw =
    10 + ingredientCount * 2 + Math.floor(instructionLength / 80) * 5

  return Math.min(
    RECOMMENDATIONS_COOK_MINUTES_MAX,
    Math.max(RECOMMENDATIONS_COOK_MINUTES_MIN, raw),
  )
}

/**
 * Scores one recipe for the current recommendation context.
 */
export function scoreRecipeSummary(
  summary: RecipeSummary,
  context: RecommendationContext,
): number {
  const approxCalories = approxCaloriesForCategory(summary.category)
  let score = 0
  const preferred = context.goal
    ? THEMEALDB_PREFERRED_CATEGORIES_BY_GOAL[context.goal]
    : THEMEALDB_PREFERRED_CATEGORIES_BY_GOAL.maintain

  if ((preferred as readonly string[]).includes(summary.category)) {
    score += 100
  }

  if (
    context.goal === 'lose' &&
    (THEMEALDB_AVOID_CATEGORIES_FOR_LOSE as readonly string[]).includes(
      summary.category,
    )
  ) {
    score -= 80
  }

  if (context.remainingCalories != null) {
    const remaining = context.remainingCalories

    if (remaining <= RECOMMENDATIONS_LOW_REMAINING_KCAL) {
      if (approxCalories <= remaining * RECOMMENDATIONS_REMAINING_HEADROOM) {
        score += 60
      } else {
        score -= 120
      }

      if (
        summary.category === 'Side' ||
        summary.category === 'Starter' ||
        summary.category === 'Vegetarian'
      ) {
        score += 40
      }
    } else if (approxCalories <= remaining * RECOMMENDATIONS_REMAINING_HEADROOM) {
      score += 50

      if (approxCalories >= remaining * 0.35) {
        score += 20
      }
    } else {
      score -= 40
    }
  }

  return score
}

/**
 * Selects and ranks recipe summaries, then attaches full recipe details.
 */
export function buildRecommendations(
  summaries: RecipeSummary[],
  detailsById: Map<string, RecipeDetail>,
  context: RecommendationContext,
): RecipeRecommendation[] {
  const unique = dedupeSummaries(summaries)
  const ranked = unique
    .map((summary) => ({
      summary,
      score: scoreRecipeSummary(summary, context),
    }))
    .filter((entry) => entry.score > -100)
    .sort((left, right) => right.score - left.score)

  const seed = hashSeed(
    `${context.dayKey}:${context.mealType}:${context.goal ?? 'none'}`,
  )
  const pool = ranked.slice(0, Math.max(RECOMMENDATIONS_COUNT * 4, 12))
  const shuffled = seededShuffle(pool, seed)

  const picks: RecipeRecommendation[] = []

  for (const entry of shuffled) {
    if (picks.length >= RECOMMENDATIONS_COUNT) {
      break
    }

    const recipe = detailsById.get(entry.summary.id)

    if (!recipe) {
      continue
    }

    picks.push({
      recipe,
      mealType: context.mealType,
      approxCalories: approxCaloriesForCategory(recipe.category),
      cookMinutes: estimateCookMinutes(
        recipe.ingredients.length,
        recipe.instructions.length,
      ),
      shortDescription: buildRecipeShortDescription(recipe.instructions),
      score: entry.score,
    })
  }

  return picks
}

/**
 * Picks candidate ids to hydrate after scoring.
 */
export function pickCandidateIds(
  summaries: RecipeSummary[],
  context: RecommendationContext,
  limit = RECOMMENDATIONS_COUNT * 3,
): string[] {
  const unique = dedupeSummaries(summaries)
  const ranked = unique
    .map((summary) => ({
      id: summary.id,
      score: scoreRecipeSummary(summary, context),
    }))
    .filter((entry) => entry.score > -100)
    .sort((left, right) => right.score - left.score)

  const seed = hashSeed(
    `${context.dayKey}:${context.mealType}:${context.goal ?? 'none'}`,
  )
  const pool = ranked.slice(0, Math.max(limit * 2, 12))
  const shuffled = seededShuffle(pool, seed)

  return shuffled.slice(0, limit).map((entry) => entry.id)
}

function dedupeSummaries(summaries: RecipeSummary[]): RecipeSummary[] {
  const seen = new Set<string>()
  const result: RecipeSummary[] = []

  for (const summary of summaries) {
    if (seen.has(summary.id)) {
      continue
    }

    seen.add(summary.id)
    result.push(summary)
  }

  return result
}

function hashSeed(value: string): number {
  let hash = 2166136261

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }

  return hash >>> 0
}

function seededShuffle<T>(items: T[], seed: number): T[] {
  const copy = [...items]
  let state = seed || 1

  for (let index = copy.length - 1; index > 0; index -= 1) {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0
    const swapIndex = state % (index + 1)
    const current = copy[index]
    copy[index] = copy[swapIndex] as T
    copy[swapIndex] = current as T
  }

  return copy
}

/**
 * Whether remaining calories should trigger the soft/light hint.
 */
export function isLowRemainingCalories(
  remainingCalories: number | null,
): boolean {
  return (
    remainingCalories != null &&
    remainingCalories <= RECOMMENDATIONS_LOW_REMAINING_KCAL
  )
}
