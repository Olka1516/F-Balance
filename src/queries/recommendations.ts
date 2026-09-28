import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { computed, type MaybeRefOrGetter, toValue } from 'vue'
import {
  RECOMMENDATIONS_QUERY_KEY,
  THEMEALDB_FILTER_QUERY_KEY,
  THEMEALDB_FILTER_STALE_TIME_MS,
  THEMEALDB_LOOKUP_QUERY_KEY,
  THEMEALDB_LOOKUP_STALE_TIME_MS,
} from '@/constants/api'
import type { MealType } from '@/constants/meals'
import {
  fetchMealById,
  fetchMealsByCategory,
} from '@/services/theMealDb'
import type {
  RecommendationContext,
  RecipeDetail,
  RecipeRecommendation,
  RecipeSummary,
  UserGoal,
} from '@/types'
import {
  buildRecommendations,
  categoriesForMealType,
  pickCandidateIds,
} from '@/utils/recommendations'

/**
 * Builds daily meal recommendations from TheMealDB with local scoring.
 */
export function useRecommendationsQuery(
  mealType: MaybeRefOrGetter<MealType>,
  goal: MaybeRefOrGetter<UserGoal | null>,
  remainingCalories: MaybeRefOrGetter<number | null>,
  dayKey: MaybeRefOrGetter<string>,
  enabled: MaybeRefOrGetter<boolean> = true,
) {
  const queryClient = useQueryClient()

  return useQuery({
    queryKey: computed(() => [
      ...RECOMMENDATIONS_QUERY_KEY,
      toValue(dayKey),
      toValue(mealType),
      toValue(goal) ?? 'none',
      toValue(remainingCalories) ?? 'none',
    ]),
    enabled: computed(() => Boolean(toValue(enabled) && toValue(dayKey))),
    staleTime: THEMEALDB_LOOKUP_STALE_TIME_MS,
    queryFn: async (): Promise<RecipeRecommendation[]> => {
      const context: RecommendationContext = {
        mealType: toValue(mealType),
        goal: toValue(goal),
        remainingCalories: toValue(remainingCalories),
        dayKey: toValue(dayKey),
      }

      const categories = categoriesForMealType(context.mealType)
      const filterResults = await Promise.allSettled(
        categories.map((category) =>
          queryClient.fetchQuery({
            queryKey: [...THEMEALDB_FILTER_QUERY_KEY, category],
            staleTime: THEMEALDB_FILTER_STALE_TIME_MS,
            queryFn: async (): Promise<RecipeSummary[]> => {
              const result = await fetchMealsByCategory(category)

              if (!result.ok) {
                throw new Error(result.code)
              }

              return result.data
            },
          }),
        ),
      )

      const summaries = filterResults.flatMap((result) =>
        result.status === 'fulfilled' ? result.value : [],
      )

      if (summaries.length === 0) {
        const rejected = filterResults.find(
          (result) => result.status === 'rejected',
        )

        if (rejected && rejected.status === 'rejected') {
          const message =
            rejected.reason instanceof Error
              ? rejected.reason.message
              : 'unavailable'
          throw new Error(message)
        }

        return []
      }

      const candidateIds = pickCandidateIds(summaries, context)
      const detailResults = await Promise.allSettled(
        candidateIds.map((id) =>
          queryClient.fetchQuery({
            queryKey: [...THEMEALDB_LOOKUP_QUERY_KEY, id],
            staleTime: THEMEALDB_LOOKUP_STALE_TIME_MS,
            queryFn: async (): Promise<RecipeDetail> => {
              const result = await fetchMealById(id)

              if (!result.ok) {
                throw new Error(result.code)
              }

              if (!result.data) {
                throw new Error('unavailable')
              }

              return result.data
            },
          }),
        ),
      )

      const detailsById = new Map<string, RecipeDetail>()

      for (const result of detailResults) {
        if (result.status !== 'fulfilled') {
          continue
        }

        detailsById.set(result.value.id, result.value)
      }

      if (detailsById.size === 0) {
        throw new Error('unavailable')
      }

      return buildRecommendations(summaries, detailsById, context)
    },
  })
}
