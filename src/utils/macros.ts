import {
  MACRO_KCAL_CARBS,
  MACRO_KCAL_FAT,
  MACRO_KCAL_PROTEIN,
} from '@/constants/dashboard'

/**
 * Macronutrient totals used across meals and daily progress.
 */
export type MacroTotals = {
  calories: number
  protein: number
  fat: number
  carbs: number
}

/**
 * Rounds a nutrition value to two decimal places.
 */
export function roundNutrition(value: number): number {
  return Math.round(value * 100) / 100
}

/**
 * Estimates calories from protein, fat, and carbs using Atwater factors.
 */
export function caloriesFromMacros(
  protein: number,
  fat: number,
  carbs: number,
): number {
  return roundNutrition(
    protein * MACRO_KCAL_PROTEIN +
      fat * MACRO_KCAL_FAT +
      carbs * MACRO_KCAL_CARBS,
  )
}

/**
 * Converts a portion value into a per-100g density.
 */
export function toPerHundredGrams(value: number, amountGrams: number): number {
  if (amountGrams <= 0) {
    return 0
  }

  return roundNutrition((value * 100) / amountGrams)
}

/**
 * Scales a per-100g density to a portion in grams.
 */
export function fromPerHundredGrams(
  perHundred: number,
  amountGrams: number,
): number {
  return roundNutrition((perHundred * amountGrams) / 100)
}

/**
 * Builds meal totals from per-100g macros and portion grams.
 */
export function macrosForAmount(
  perHundred: MacroTotals,
  amountGrams: number,
): MacroTotals {
  return {
    calories: fromPerHundredGrams(perHundred.calories, amountGrams),
    protein: fromPerHundredGrams(perHundred.protein, amountGrams),
    fat: fromPerHundredGrams(perHundred.fat, amountGrams),
    carbs: fromPerHundredGrams(perHundred.carbs, amountGrams),
  }
}

/**
 * Converts portion macros into per-100g storage values.
 */
export function macrosToPerHundred(
  portion: MacroTotals,
  amountGrams: number,
): MacroTotals {
  return {
    calories: toPerHundredGrams(portion.calories, amountGrams),
    protein: toPerHundredGrams(portion.protein, amountGrams),
    fat: toPerHundredGrams(portion.fat, amountGrams),
    carbs: toPerHundredGrams(portion.carbs, amountGrams),
  }
}

/**
 * Sums macronutrient totals.
 */
export function sumMacros(items: MacroTotals[]): MacroTotals {
  return items.reduce(
    (acc, item) => ({
      calories: roundNutrition(acc.calories + item.calories),
      protein: roundNutrition(acc.protein + item.protein),
      fat: roundNutrition(acc.fat + item.fat),
      carbs: roundNutrition(acc.carbs + item.carbs),
    }),
    { calories: 0, protein: 0, fat: 0, carbs: 0 },
  )
}

/**
 * Scales macros by a servings factor.
 */
export function scaleMacros(totals: MacroTotals, factor: number): MacroTotals {
  return {
    calories: roundNutrition(totals.calories * factor),
    protein: roundNutrition(totals.protein * factor),
    fat: roundNutrition(totals.fat * factor),
    carbs: roundNutrition(totals.carbs * factor),
  }
}

/**
 * Remaining daily calories (may be negative when over target).
 */
export function remainingCalories(target: number, consumed: number): number {
  return roundNutrition(target - consumed)
}
