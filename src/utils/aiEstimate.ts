import type { AiNutritionEstimate } from '@/types'
import { AI_EMPTY_CALORIES_MAX } from '@/constants/ai'

/**
 * Whether an AI estimate looks like “no food found”
 * (no macros and negligible calories).
 */
export function isEmptyAiEstimate(estimate: AiNutritionEstimate): boolean {
  const macros = [estimate.protein, estimate.fat, estimate.carbs]
  const allMacrosEmpty = macros.every((value) => value == null || value === 0)

  return allMacrosEmpty && estimate.calories <= AI_EMPTY_CALORIES_MAX
}

/**
 * Returns a blank portion estimate used when AI finds no food.
 */
export function emptyAiEstimate(
  cached = false,
): AiNutritionEstimate {
  return {
    name: null,
    calories: 0,
    protein: 0,
    fat: 0,
    carbs: 0,
    cached,
  }
}
