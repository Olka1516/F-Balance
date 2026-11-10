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
