import {
  MACRO_SPLIT_BY_GOAL,
} from '@/constants/profile'
import {
  MACRO_KCAL_CARBS,
  MACRO_KCAL_FAT,
  MACRO_KCAL_PROTEIN,
} from '@/constants/dashboard'
import type { UserGoal } from '@/types'
import { roundNutrition } from '@/utils/macros'

/**
 * Suggested daily macro targets in grams.
 */
export type MacroTargets = {
  protein: number
  fat: number
  carbs: number
}

/**
 * Builds suggested macro gram targets from daily calories and goal.
 */
export function suggestMacroTargets(
  dailyCalories: number,
  goal: UserGoal | null,
): MacroTargets {
  const split = goal ? MACRO_SPLIT_BY_GOAL[goal] : MACRO_SPLIT_BY_GOAL.default

  return {
    protein: roundNutrition((dailyCalories * split.protein) / MACRO_KCAL_PROTEIN),
    fat: roundNutrition((dailyCalories * split.fat) / MACRO_KCAL_FAT),
    carbs: roundNutrition((dailyCalories * split.carbs) / MACRO_KCAL_CARBS),
  }
}
