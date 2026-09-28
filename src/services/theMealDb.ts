import {
  THEMEALDB_API_BASE_URL,
  THEMEALDB_TIMEOUT_MS,
} from '@/constants/api'
import type { RecipeDetail, RecipeSummary } from '@/types'

export type TheMealDbResult<T> =
  | { ok: true; data: T }
  | { ok: false; code: 'rateLimited' | 'unavailable' | 'unknown' }

type TheMealDbFilterMeal = {
  idMeal?: string
  strMeal?: string
  strMealThumb?: string
  strCategory?: string
}

type TheMealDbLookupMeal = TheMealDbFilterMeal & {
  strArea?: string | null
  strTags?: string | null
  strInstructions?: string | null
  strYoutube?: string | null
  strSource?: string | null
  [key: string]: string | null | undefined
}

/**
 * Lists meal summaries for one TheMealDB category.
 */
export async function fetchMealsByCategory(
  category: string,
): Promise<TheMealDbResult<RecipeSummary[]>> {
  const result = await fetchTheMealDbJson<{ meals: TheMealDbFilterMeal[] | null }>(
    `filter.php?c=${encodeURIComponent(category)}`,
  )

  if (!result.ok) {
    return result
  }

  const meals = Array.isArray(result.data.meals) ? result.data.meals : []
  const summaries = meals
    .map((meal) => mapFilterMeal(meal, category))
    .filter((meal): meal is RecipeSummary => meal !== null)

  return { ok: true, data: summaries }
}

/**
 * Loads full recipe details for one TheMealDB meal id.
 */
export async function fetchMealById(
  mealId: string,
): Promise<TheMealDbResult<RecipeDetail | null>> {
  const result = await fetchTheMealDbJson<{ meals: TheMealDbLookupMeal[] | null }>(
    `lookup.php?i=${encodeURIComponent(mealId)}`,
  )

  if (!result.ok) {
    return result
  }

  const meal = Array.isArray(result.data.meals) ? result.data.meals[0] : null

  if (!meal) {
    return { ok: true, data: null }
  }

  return { ok: true, data: mapLookupMeal(meal) }
}

async function fetchTheMealDbJson<T>(
  path: string,
): Promise<TheMealDbResult<T>> {
  const controller = new AbortController()
  const timeoutId = window.setTimeout(
    () => controller.abort(),
    THEMEALDB_TIMEOUT_MS,
  )

  try {
    const response = await fetch(`${THEMEALDB_API_BASE_URL}/${path}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      signal: controller.signal,
    })

    if (response.status === 429) {
      return { ok: false, code: 'rateLimited' }
    }

    if (!response.ok) {
      return { ok: false, code: 'unavailable' }
    }

    const payload = (await response.json()) as T
    return { ok: true, data: payload }
  } catch {
    return { ok: false, code: 'unavailable' }
  } finally {
    window.clearTimeout(timeoutId)
  }
}

function mapFilterMeal(
  meal: TheMealDbFilterMeal,
  fallbackCategory: string,
): RecipeSummary | null {
  const id = meal.idMeal?.trim()
  const name = meal.strMeal?.trim()
  const thumbUrl = meal.strMealThumb?.trim()

  if (!id || !name || !thumbUrl) {
    return null
  }

  return {
    id,
    name,
    thumbUrl,
    category: meal.strCategory?.trim() || fallbackCategory,
  }
}

function mapLookupMeal(meal: TheMealDbLookupMeal): RecipeDetail | null {
  const id = meal.idMeal?.trim()
  const name = meal.strMeal?.trim()
  const thumbUrl = meal.strMealThumb?.trim()
  const instructions = meal.strInstructions?.trim()

  if (!id || !name || !thumbUrl || !instructions) {
    return null
  }

  const ingredients = []

  for (let index = 1; index <= 20; index += 1) {
    const ingredient = meal[`strIngredient${index}`]?.trim()
    const measure = meal[`strMeasure${index}`]?.trim() ?? ''

    if (!ingredient) {
      continue
    }

    ingredients.push({
      name: ingredient,
      measure,
    })
  }

  const tags = (meal.strTags ?? '')
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)

  return {
    id,
    name,
    thumbUrl,
    category: meal.strCategory?.trim() || 'Miscellaneous',
    area: meal.strArea?.trim() || null,
    tags,
    instructions,
    ingredients,
    youtubeUrl: meal.strYoutube?.trim() || null,
    sourceUrl: meal.strSource?.trim() || null,
  }
}
