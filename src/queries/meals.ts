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
  fetchDailyEntriesForDate,
  fetchDailyEntriesInRange,
  fetchUserMeal,
  fetchUserMeals,
  formatLocalDate,
  updateManualMeal,
} from '@/services/meals'
import type {
  DailyEntryWithMeal,
  ManualMealInput,
  MealWithIngredients,
} from '@/types'
import { listRecentLocalDates } from '@/utils/dashboard'

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
 * Creates or updates a manual meal and refreshes related caches.
 */
export function useSaveManualMealMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: {
      userId: string
      mealId?: string
      input: ManualMealInput
      logToToday?: boolean
    }): Promise<MealWithIngredients> => {
      const result = payload.mealId
        ? await updateManualMeal(payload.userId, payload.mealId, payload.input)
        : await createManualMeal(payload.userId, payload.input)

      if (!result.ok) {
        throw new Error(result.code)
      }

      if (!payload.mealId && payload.logToToday) {
        await addMealToToday(payload.userId, result.data.id)
      }

      return result.data
    },
    onSuccess: (_meal, variables) => {
      void queryClient.invalidateQueries({
        queryKey: [...MEALS_QUERY_KEY, variables.userId],
      })

      if (!variables.mealId && variables.logToToday) {
        const today = formatLocalDate(new Date())

        void queryClient.invalidateQueries({
          queryKey: [...DAILY_ENTRIES_QUERY_KEY, variables.userId, today],
        })
        void queryClient.invalidateQueries({
          queryKey: [...DAILY_ENTRIES_QUERY_KEY, variables.userId, 'week'],
        })
      }
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
 * Loads today's diary entries for the dashboard.
 */
export function useTodayDailyEntriesQuery(
  userId: MaybeRefOrGetter<string | undefined>,
) {
  const today = formatLocalDate(new Date())

  return useQuery({
    queryKey: computed(() => [
      ...DAILY_ENTRIES_QUERY_KEY,
      toValue(userId) ?? 'anonymous',
      today,
    ]),
    enabled: computed(() => Boolean(toValue(userId))),
    queryFn: async (): Promise<DailyEntryWithMeal[]> => {
      const id = toValue(userId)

      if (!id) {
        return []
      }

      const result = await fetchDailyEntriesForDate(id, today)

      if (!result.ok) {
        throw new Error(result.code)
      }

      return result.data
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
      const today = formatLocalDate(new Date())

      void queryClient.invalidateQueries({
        queryKey: [...DAILY_ENTRIES_QUERY_KEY, variables.userId, today],
      })
      void queryClient.invalidateQueries({
        queryKey: [...DAILY_ENTRIES_QUERY_KEY, variables.userId, 'week'],
      })
    },
  })
}

/**
 * Loads diary entries for the last N local calendar days.
 */
export function useWeekDailyEntriesQuery(
  userId: MaybeRefOrGetter<string | undefined>,
  dayCount: MaybeRefOrGetter<number>,
  enabled: MaybeRefOrGetter<boolean> = true,
) {
  const dates = computed(() => listRecentLocalDates(toValue(dayCount)))
  const fromDate = computed(() => dates.value[0] ?? '')
  const toDate = computed(() => dates.value[dates.value.length - 1] ?? '')

  return useQuery({
    queryKey: computed(() => [
      ...DAILY_ENTRIES_QUERY_KEY,
      toValue(userId) ?? 'anonymous',
      'week',
      fromDate.value,
      toDate.value,
    ]),
    enabled: computed(
      () => Boolean(toValue(userId) && fromDate.value && toValue(enabled)),
    ),
    queryFn: async (): Promise<DailyEntryWithMeal[]> => {
      const id = toValue(userId)

      if (!id || !fromDate.value || !toDate.value) {
        return []
      }

      const result = await fetchDailyEntriesInRange(
        id,
        fromDate.value,
        toDate.value,
      )

      if (!result.ok) {
        throw new Error(result.code)
      }

      return result.data
    },
  })
}
