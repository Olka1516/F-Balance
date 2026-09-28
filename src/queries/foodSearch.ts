import { useQuery } from '@tanstack/vue-query'
import { computed, type MaybeRefOrGetter, toValue } from 'vue'
import {
  OPEN_FOOD_FACTS_SEARCH_MIN_CHARS,
  OPEN_FOOD_FACTS_SEARCH_QUERY_KEY,
  OPEN_FOOD_FACTS_SEARCH_STALE_TIME_MS,
} from '@/constants/api'
import { searchOpenFoodFacts } from '@/services/openFoodFacts'
import type { FoodSearchHit } from '@/types'

/**
 * Searches Open Food Facts with debounce-ready query text and cache.
 */
export function useFoodSearchQuery(
  searchText: MaybeRefOrGetter<string>,
) {
  const normalizedQuery = computed(() => toValue(searchText).trim())
  const canSearch = computed(
    () => normalizedQuery.value.length >= OPEN_FOOD_FACTS_SEARCH_MIN_CHARS,
  )

  return useQuery({
    queryKey: computed(() => [
      ...OPEN_FOOD_FACTS_SEARCH_QUERY_KEY,
      normalizedQuery.value,
    ]),
    enabled: canSearch,
    staleTime: OPEN_FOOD_FACTS_SEARCH_STALE_TIME_MS,
    queryFn: async (): Promise<FoodSearchHit[]> => {
      const result = await searchOpenFoodFacts(normalizedQuery.value)

      if (!result.ok) {
        throw new Error(result.code)
      }

      return result.data
    },
  })
}
