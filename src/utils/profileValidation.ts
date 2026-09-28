import {
  PROFILE_AGE_MAX,
  PROFILE_AGE_MIN,
  PROFILE_DAILY_CALORIES_MAX,
  PROFILE_DAILY_CALORIES_MIN,
  PROFILE_DAILY_CARBS_MAX_G,
  PROFILE_DAILY_FAT_MAX_G,
  PROFILE_DAILY_MACRO_MIN_G,
  PROFILE_DAILY_PROTEIN_MAX_G,
  PROFILE_HEIGHT_MAX_CM,
  PROFILE_HEIGHT_MIN_CM,
  PROFILE_WEIGHT_MAX_KG,
  PROFILE_WEIGHT_MIN_KG,
} from '@/constants/profile'
import { parseOptionalNumber } from '@/utils/profileForm'

/**
 * Builds Regle-compatible optional number bounds for profile fields.
 */
export function createOptionalNumberRule(
  min: number,
  max: number,
): (value: string) => boolean {
  return (value: string) => {
    if (!value.trim()) {
      return true
    }

    const parsed = parseOptionalNumber(value)

    if (parsed == null) {
      return false
    }

    return parsed >= min && parsed <= max
  }
}

/**
 * Optional weight validator for profile forms.
 */
export const isOptionalWeightValid = createOptionalNumberRule(
  PROFILE_WEIGHT_MIN_KG,
  PROFILE_WEIGHT_MAX_KG,
)

/**
 * Optional height validator for profile forms.
 */
export const isOptionalHeightValid = createOptionalNumberRule(
  PROFILE_HEIGHT_MIN_CM,
  PROFILE_HEIGHT_MAX_CM,
)

/**
 * Optional age validator for profile forms.
 */
export const isOptionalAgeValid = createOptionalNumberRule(
  PROFILE_AGE_MIN,
  PROFILE_AGE_MAX,
)

/**
 * Optional daily calories validator for profile forms.
 */
export const isOptionalDailyCaloriesValid = createOptionalNumberRule(
  PROFILE_DAILY_CALORIES_MIN,
  PROFILE_DAILY_CALORIES_MAX,
)

/**
 * Optional daily protein validator for profile forms.
 */
export const isOptionalDailyProteinValid = createOptionalNumberRule(
  PROFILE_DAILY_MACRO_MIN_G,
  PROFILE_DAILY_PROTEIN_MAX_G,
)

/**
 * Optional daily fat validator for profile forms.
 */
export const isOptionalDailyFatValid = createOptionalNumberRule(
  PROFILE_DAILY_MACRO_MIN_G,
  PROFILE_DAILY_FAT_MAX_G,
)

/**
 * Optional daily carbs validator for profile forms.
 */
export const isOptionalDailyCarbsValid = createOptionalNumberRule(
  PROFILE_DAILY_MACRO_MIN_G,
  PROFILE_DAILY_CARBS_MAX_G,
)
