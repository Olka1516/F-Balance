import type { MealType } from '@/constants/meals'
import type { UserGoal } from '@/types/userProfile'

/**
 * Compact TheMealDB filter hit before a full lookup.
 */
export type RecipeSummary = {
  id: string
  name: string
  thumbUrl: string
  category: string
}

/**
 * Ingredient line from a TheMealDB meal.
 */
export type RecipeIngredient = {
  name: string
  measure: string
}

/**
 * Full recipe used on the Recommendations page.
 */
export type RecipeDetail = {
  id: string
  name: string
  thumbUrl: string
  category: string
  area: string | null
  tags: string[]
  instructions: string
  ingredients: RecipeIngredient[]
  youtubeUrl: string | null
  sourceUrl: string | null
}

/**
 * Scored recommendation card ready for the UI.
 */
export type RecipeRecommendation = {
  recipe: RecipeDetail
  mealType: MealType
  approxCalories: number
  cookMinutes: number
  shortDescription: string
  score: number
}

/**
 * Context used to pick and score recommendations.
 */
export type RecommendationContext = {
  mealType: MealType
  goal: UserGoal | null
  remainingCalories: number | null
  dayKey: string
}
