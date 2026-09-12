import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { computed, type MaybeRefOrGetter, toValue } from 'vue'
import { PROFILE_QUERY_KEY } from '@/constants/profile'
import {
  fetchUserProfile,
  upsertUserProfile,
  type ProfileActionResult,
} from '@/services/profile'
import type { UserProfile, UserProfileInput } from '@/types'

/**
 * Loads and caches the current user's profile.
 */
export function useProfileQuery(userId: MaybeRefOrGetter<string | undefined>) {
  return useQuery({
    queryKey: computed(() => [...PROFILE_QUERY_KEY, toValue(userId) ?? 'anonymous']),
    enabled: computed(() => Boolean(toValue(userId))),
    queryFn: async (): Promise<UserProfile | null> => {
      const id = toValue(userId)

      if (!id) {
        return null
      }

      const result = await fetchUserProfile(id)

      if (!result.ok) {
        throw new Error(result.code)
      }

      return result.profile
    },
  })
}

/**
 * Saves the current user's profile and refreshes the profile query cache.
 */
export function useUpsertProfileMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: {
      userId: string
      input: UserProfileInput
    }): Promise<UserProfile | null> => {
      const result: ProfileActionResult = await upsertUserProfile(
        payload.userId,
        payload.input,
      )

      if (!result.ok) {
        throw new Error(result.code)
      }

      return result.profile
    },
    onSuccess: (profile, variables) => {
      queryClient.setQueryData(
        [...PROFILE_QUERY_KEY, variables.userId],
        profile,
      )
    },
  })
}
