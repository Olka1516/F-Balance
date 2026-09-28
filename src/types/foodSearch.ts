/**
 * Normalized product hit from Open Food Facts search.
 */
export type FoodSearchHit = {
  id: string
  name: string
  brand: string | null
  caloriesPer100g: number | null
  proteinPer100g: number | null
  fatPer100g: number | null
  carbsPer100g: number | null
  isComplete: boolean
}
