/**
 * Open Food Facts product search endpoint.
 */
export const OPEN_FOOD_FACTS_SEARCH_URL =
  'https://world.openfoodfacts.org/cgi/search.pl'

/**
 * Debounce delay before sending a product search request.
 */
export const OPEN_FOOD_FACTS_SEARCH_DEBOUNCE_MS = 600

/**
 * Minimum characters required before searching products.
 */
export const OPEN_FOOD_FACTS_SEARCH_MIN_CHARS = 3

/**
 * Maximum products returned for one search page.
 */
export const OPEN_FOOD_FACTS_SEARCH_PAGE_SIZE = 12

/**
 * How long Open Food Facts search results stay fresh in TanStack Query.
 */
export const OPEN_FOOD_FACTS_SEARCH_STALE_TIME_MS = 10 * 60 * 1000

/**
 * Request timeout for Open Food Facts search calls.
 */
export const OPEN_FOOD_FACTS_SEARCH_TIMEOUT_MS = 12_000

/**
 * TanStack Query key root for Open Food Facts search.
 */
export const OPEN_FOOD_FACTS_SEARCH_QUERY_KEY = [
  'open-food-facts',
  'search',
] as const

/**
 * TheMealDB API base URL (free demo key).
 */
export const THEMEALDB_API_BASE_URL =
  'https://www.themealdb.com/api/json/v1/1'

/**
 * How long TheMealDB category lists stay fresh in TanStack Query.
 */
export const THEMEALDB_FILTER_STALE_TIME_MS = 24 * 60 * 60 * 1000

/**
 * How long TheMealDB meal details stay fresh in TanStack Query.
 */
export const THEMEALDB_LOOKUP_STALE_TIME_MS = 24 * 60 * 60 * 1000

/**
 * Request timeout for TheMealDB calls.
 */
export const THEMEALDB_TIMEOUT_MS = 12_000

/**
 * TanStack Query key root for TheMealDB category filters.
 */
export const THEMEALDB_FILTER_QUERY_KEY = ['themealdb', 'filter'] as const

export const THEMEALDB_LOOKUP_QUERY_KEY = ['themealdb', 'lookup'] as const

/**
 * TanStack Query key root for recommendation picks.
 */
export const RECOMMENDATIONS_QUERY_KEY = ['recommendations'] as const
