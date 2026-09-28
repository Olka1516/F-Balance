import { getSupabase, getSupabaseReadiness } from '@/services/supabase'
import {
  createSupabaseFailure,
  mapSupabaseErrorCode,
} from '@/services/supabase/errors'
import type { UserProfile, UserProfileInput } from '@/types'
import { mapProfileRow } from '@/utils/profileForm'

export type ProfileActionResult =
  | { ok: true; profile: UserProfile | null }
  | { ok: false; code: string }

const PROFILE_SELECT =
  'user_id, goal, weight, height, age, activity_level, daily_calories, daily_protein, daily_fat, daily_carbs, onboarding_completed, updated_at'

/**
 * Loads the authenticated user's profile row, or null when missing.
 */
export async function fetchUserProfile(
  userId: string,
): Promise<ProfileActionResult> {
  const readiness = getSupabaseReadiness()

  if (!readiness.ready) {
    return createSupabaseFailure(readiness.code)
  }

  const { data, error } = await getSupabase()
    .from('user_profiles')
    .select(PROFILE_SELECT)
    .eq('user_id', userId)
    .maybeSingle()

  if (error) {
    return { ok: false, code: mapProfileErrorCode(error) }
  }

  if (!data) {
    return { ok: true, profile: null }
  }

  return { ok: true, profile: mapProfileRow(data) }
}

/**
 * Creates or updates the authenticated user's profile.
 */
export async function upsertUserProfile(
  userId: string,
  input: UserProfileInput,
): Promise<ProfileActionResult> {
  const readiness = getSupabaseReadiness()

  if (!readiness.ready) {
    return createSupabaseFailure(readiness.code)
  }

  const { data, error } = await getSupabase()
    .from('user_profiles')
    .upsert(
      {
        user_id: userId,
        goal: input.goal,
        weight: input.weight,
        height: input.height,
        age: input.age,
        activity_level: input.activityLevel,
        daily_calories: input.dailyCalories,
        daily_protein: input.dailyProtein,
        daily_fat: input.dailyFat,
        daily_carbs: input.dailyCarbs,
        onboarding_completed: input.onboardingCompleted,
      },
      { onConflict: 'user_id' },
    )
    .select(PROFILE_SELECT)
    .single()

  if (error) {
    return { ok: false, code: mapProfileErrorCode(error) }
  }

  return { ok: true, profile: mapProfileRow(data) }
}

function mapProfileErrorCode(error: {
  message: string
  code?: string
}): string {
  const message = error.message.toLowerCase()

  if (error.code === '42P01' || message.includes('schema cache')) {
    return 'tableMissing'
  }

  if (error.code === '42501' || message.includes('row-level security')) {
    return 'permissionDenied'
  }

  return mapSupabaseErrorCode(error)
}
