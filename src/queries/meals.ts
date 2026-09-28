import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { computed, type MaybeRefOrGetter, toValue } from 'vue'
import {
  DAILY_ENTRIES_QUERY_KEY,
  MEALS_QUERY_KEY,
} from '@/constants/meals'
import {
  addMealToToday,
  createManualMeal,
  deleteUserMeal,
  duplicateUserMeal,
  fetchUserMeal,
  fetchUserMeals,
  updateManualMeal,
} from '@/services/meals'
import type { ManualMealInput, MealWithIngredients } from '@/types'

/**
 * Loads and caches the current user's saved meals.
 */
export function useMealsQuery(userId: MaybeRefOrGetter<string | undefined>) {
  return useQuery({
    queryKey: computed(() => [...MEALS_QUERY_KEY, toValue(userId) ?? 'anonymous']),
    enabled: computed(() => Boolean(toValue(userId))),
    queryFn: async (): Promise<MealWithIngredients[]> => {
      const id = toValue(userId)

      if (!id) {
        return []
      }

      const result = await fetchUserMeals(id)

      if (!result.ok) {
        throw new Error(result.code)
      }

      return result.data
    },
  })
}

/**
 * Loads one meal for the add/edit form.
 */
export function useMealQuery(
  userId: MaybeRefOrGetter<string | undefined>,
  mealId: MaybeRefOrGetter<string | undefined>,
) {
  return useQuery({
    queryKey: computed(() => [
      ...MEALS_QUERY_KEY,
      toValue(userId) ?? 'anonymous',
      toValue(mealId) ?? 'new',
    ]),
    enabled: computed(() => Boolean(toValue(userId) && toValue(mealId))),
    queryFn: async (): Promise<MealWithIngredients | null> => {
      const id = toValue(userId)
      const meal = toValue(mealId)

      if (!id || !meal) {
        return null
      }

      const result = await fetchUserMeal(id, meal)

      if (!result.ok) {
        throw new Error(result.code)
      }

      return result.data
    },
  })
}

/**
 * Creates or updates a manual meal and refreshes the meals list.
 */
export function useSaveManualMealMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: {
      userId: string
      mealId?: string
      input: ManualMealInput
    }): Promise<MealWithIngredients> => {
      const result = payload.mealId
        ? await updateManualMeal(payload.userId, payload.mealId, payload.input)
        : await createManualMeal(payload.userId, payload.input)

      if (!result.ok) {
        throw new Error(result.code)
      }

      return result.data
    },
    onSuccess: (_meal, variables) => {
      void queryClient.invalidateQueries({
        queryKey: [...MEALS_QUERY_KEY, variables.userId],
      })
    },
  })
}

/**
 * Deletes a meal and refreshes the list.
 */
export function useDeleteMealMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: { userId: string; mealId: string }) => {
      const result = await deleteUserMeal(payload.userId, payload.mealId)

      if (!result.ok) {
        throw new Error(result.code)
      }
    },
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: [...MEALS_QUERY_KEY, variables.userId],
      })
    },
  })
}

/**
 * Duplicates a meal and refreshes the list.
 */
export function useDuplicateMealMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: {
      userId: string
      mealId: string
      copyLabel: string
    }) => {
      const result = await duplicateUserMeal(
        payload.userId,
        payload.mealId,
        payload.copyLabel,
      )

      if (!result.ok) {
        throw new Error(result.code)
      }

      return result.data
    },
    onSuccess: (_meal, variables) => {
      void queryClient.invalidateQueries({
        queryKey: [...MEALS_QUERY_KEY, variables.userId],
      })
    },
  })
}

/**
 * Adds a meal to today's diary and refreshes daily entries.
 */
export function useAddMealToTodayMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: { userId: string; mealId: string }) => {
      const result = await addMealToToday(payload.userId, payload.mealId)

      if (!result.ok) {
        throw new Error(result.code)
      }

      return result.data
    },
    onSuccess: (_entry, variables) => {
      void queryClient.invalidateQueries({
        queryKey: [...DAILY_ENTRIES_QUERY_KEY, variables.userId],
      })
    },
  })
}
