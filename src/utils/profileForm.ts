import {
  ACTIVITY_LEVELS,
  USER_GOALS,
} from '@/constants/profile'
import type {
  ActivityLevel,
  ProfileFormValues,
  UserGoal,
  UserProfile,
  UserProfileInput,
} from '@/types'

type UserProfileRow = {
  user_id: string
  goal: string | null
  weight: number | string | null
  height: number | string | null
  age: number | null
  activity_level: string | null
  daily_calories: number | null
  daily_protein: number | string | null
  daily_fat: number | string | null
  daily_carbs: number | string | null
  onboarding_completed: boolean
  updated_at: string
}

/**
 * Empty profile form values for onboarding.
 */
export function createEmptyProfileForm(): ProfileFormValues {
  return {
    goal: '',
    weight: '',
    height: '',
    age: '',
    activityLevel: '',
    dailyCalories: '',
    dailyProtein: '',
    dailyFat: '',
    dailyCarbs: '',
  }
}

/**
 * Maps a stored profile into editable form strings.
 */
export function profileToFormValues(profile: UserProfile | null): ProfileFormValues {
  if (!profile) {
    return createEmptyProfileForm()
  }

  return {
    goal: profile.goal ?? '',
    weight: profile.weight == null ? '' : String(profile.weight),
    height: profile.height == null ? '' : String(profile.height),
    age: profile.age == null ? '' : String(profile.age),
    activityLevel: profile.activityLevel ?? '',
    dailyCalories:
      profile.dailyCalories == null ? '' : String(profile.dailyCalories),
    dailyProtein:
      profile.dailyProtein == null ? '' : String(profile.dailyProtein),
    dailyFat: profile.dailyFat == null ? '' : String(profile.dailyFat),
    dailyCarbs: profile.dailyCarbs == null ? '' : String(profile.dailyCarbs),
  }
}

/**
 * Parses an optional numeric form field.
 */
export function parseOptionalNumber(value: string): number | null {
  const trimmed = value.trim()

  if (!trimmed) {
    return null
  }

  const parsed = Number(trimmed)

  if (!Number.isFinite(parsed)) {
    return null
  }

  return parsed
}

/**
 * Whether a string is a known profile goal.
 */
export function isUserGoal(value: string): value is UserGoal {
  return (USER_GOALS as readonly string[]).includes(value)
}

/**
 * Whether a string is a known activity level.
 */
export function isActivityLevel(value: string): value is ActivityLevel {
  return (ACTIVITY_LEVELS as readonly string[]).includes(value)
}

/**
 * Builds a profile upsert payload from form values.
 */
export function formValuesToProfileInput(
  values: ProfileFormValues,
  onboardingCompleted: boolean,
): UserProfileInput {
  return {
    goal: isUserGoal(values.goal) ? values.goal : null,
    weight: parseOptionalNumber(values.weight),
    height: parseOptionalNumber(values.height),
    age: parseOptionalNumber(values.age),
    activityLevel: isActivityLevel(values.activityLevel)
      ? values.activityLevel
      : null,
    dailyCalories: parseOptionalNumber(values.dailyCalories),
    dailyProtein: parseOptionalNumber(values.dailyProtein),
    dailyFat: parseOptionalNumber(values.dailyFat),
    dailyCarbs: parseOptionalNumber(values.dailyCarbs),
    onboardingCompleted,
  }
}

/**
 * Maps a database row to the app profile type.
 */
export function mapProfileRow(row: UserProfileRow): UserProfile {
  return {
    userId: row.user_id,
    goal: row.goal && isUserGoal(row.goal) ? row.goal : null,
    weight: row.weight == null ? null : Number(row.weight),
    height: row.height == null ? null : Number(row.height),
    age: row.age,
    activityLevel:
      row.activity_level && isActivityLevel(row.activity_level)
        ? row.activity_level
        : null,
    dailyCalories: row.daily_calories,
    dailyProtein:
      row.daily_protein == null ? null : Number(row.daily_protein),
    dailyFat: row.daily_fat == null ? null : Number(row.daily_fat),
    dailyCarbs: row.daily_carbs == null ? null : Number(row.daily_carbs),
    onboardingCompleted: row.onboarding_completed,
    updatedAt: row.updated_at,
  }
}
