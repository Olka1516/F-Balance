import {
  OPEN_FOOD_FACTS_SEARCH_PAGE_SIZE,
  OPEN_FOOD_FACTS_SEARCH_TIMEOUT_MS,
  OPEN_FOOD_FACTS_SEARCH_URL,
} from '@/constants/api'
import type { FoodSearchHit } from '@/types'
import { mapOpenFoodFactsProduct } from '@/utils/openFoodFacts'

export type FoodSearchResult =
  | { ok: true; data: FoodSearchHit[] }
  | { ok: false; code: 'rateLimited' | 'unavailable' | 'unknown' }

/**
 * Searches Open Food Facts products by free-text query.
 */
export async function searchOpenFoodFacts(
  query: string,
): Promise<FoodSearchResult> {
  const trimmed = query.trim()

  if (!trimmed) {
    return { ok: true, data: [] }
  }

  const params = new URLSearchParams({
    search_terms: trimmed,
    search_simple: '1',
    action: 'process',
    json: '1',
    page_size: String(OPEN_FOOD_FACTS_SEARCH_PAGE_SIZE),
    fields: 'code,product_name,product_name_en,brands,nutriments',
  })

  const controller = new AbortController()
  const timeoutId = window.setTimeout(
    () => controller.abort(),
    OPEN_FOOD_FACTS_SEARCH_TIMEOUT_MS,
  )

  try {
    const response = await fetch(
      `${OPEN_FOOD_FACTS_SEARCH_URL}?${params.toString()}`,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
        signal: controller.signal,
      },
    )

    if (response.status === 429) {
      return { ok: false, code: 'rateLimited' }
    }

    if (!response.ok) {
      return { ok: false, code: 'unavailable' }
    }

    const payload = (await response.json()) as {
      products?: unknown[]
    }

    const products = Array.isArray(payload.products) ? payload.products : []
    const hits = products
      .map((product) =>
        mapOpenFoodFactsProduct(
          product as Parameters<typeof mapOpenFoodFactsProduct>[0],
        ),
      )
      .filter((hit): hit is FoodSearchHit => hit !== null)

    return { ok: true, data: hits }
  } catch {
    return { ok: false, code: 'unavailable' }
  } finally {
    window.clearTimeout(timeoutId)
  }
}
