/**
 * Origin of a food item's nutritional data.
 */
export type FoodSource = 'manual' | 'open_food_facts' | 'ai'

/**
 * Food product with per-serving macronutrients.
 */
export type Food = {
  id: string
  name: string
  calories: number
  protein: number
  fat: number
  carbs: number
  source: FoodSource
}
