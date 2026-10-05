import { roundNutrition } from '@/utils/macros'
import type { FoodSearchHit } from '@/types'

type OffNutriments = Record<string, number | string | undefined>

type OffProduct = {
  code?: string
  product_name?: string
  product_name_en?: string
  brands?: string
  nutriments?: OffNutriments
}

/**
 * Maps a raw Open Food Facts product into a searchable hit.
 */
export function mapOpenFoodFactsProduct(
  product: OffProduct,
): FoodSearchHit | null {
  const id = String(product.code ?? '').trim()
  const name = decodeHtmlEntities(
    String(product.product_name?.trim() || product.product_name_en?.trim() || ''),
  )

  if (!id || !name) {
    return null
  }

  const nutriments = product.nutriments ?? {}
  const caloriesPer100g = readNutrient(nutriments, [
    'energy-kcal_100g',
    'energy-kcal',
  ])
  const energyKj = readNutrient(nutriments, ['energy_100g', 'energy'])
  const calories =
    caloriesPer100g ??
    (energyKj == null ? null : roundNutrition(energyKj / 4.184))
  const proteinPer100g = readNutrient(nutriments, ['proteins_100g', 'proteins'])
  const fatPer100g = readNutrient(nutriments, ['fat_100g', 'fat'])
  const carbsPer100g = readNutrient(nutriments, [
    'carbohydrates_100g',
    'carbohydrates',
  ])
  const brand =
    decodeHtmlEntities(
      String(product.brands ?? '')
        .split(',')[0]
        ?.trim() || '',
    ) || null

  return {
    id,
    name,
    brand,
    caloriesPer100g: calories,
    proteinPer100g,
    fatPer100g,
    carbsPer100g,
    isComplete:
      calories != null &&
      proteinPer100g != null &&
      fatPer100g != null &&
      carbsPer100g != null,
  }
}

/**
 * Builds display label for a search hit.
 */
export function formatFoodSearchLabel(hit: FoodSearchHit): string {
  if (!hit.brand) {
    return hit.name
  }

  return `${hit.name} · ${hit.brand}`
}

function readNutrient(
  nutriments: OffNutriments,
  keys: string[],
): number | null {
  for (const key of keys) {
    const raw = nutriments[key]

    if (raw == null || raw === '') {
      continue
    }

    const value = Number(raw)

    if (Number.isFinite(value) && value >= 0) {
      return roundNutrition(value)
    }
  }

  return null
}

function decodeHtmlEntities(value: string): string {
  if (!value || !value.includes('&')) {
    return value
  }

  const textarea = document.createElement('textarea')
  textarea.innerHTML = value
  return textarea.value
}
