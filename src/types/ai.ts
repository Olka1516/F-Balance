/**
 * Structured AI nutrition estimate (portion-level, editable by the user).
 */
export type AiNutritionEstimate = {
  name: string | null
  calories: number
  protein: number | null
  fat: number | null
  carbs: number | null
  cached: boolean
}

/**
 * @deprecated Use AiNutritionEstimate — kept as an alias for older imports.
 */
export type AiCalorieEstimate = AiNutritionEstimate

/**
 * Structured AI service failure codes shown via i18n.
 */
export type AiServiceErrorCode =
  | 'unauthorized'
  | 'cooldown'
  | 'rateLimited'
  | 'dailyLimit'
  | 'invalidDescription'
  | 'invalidImage'
  | 'imageTooLarge'
  | 'unavailable'
  | 'misconfigured'
  | 'modelUnavailable'
  | 'unknown'
