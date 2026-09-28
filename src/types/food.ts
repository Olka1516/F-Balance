/**
 * Origin of a food item's nutritional data.
 */
export type FoodSource = 'manual' | 'open_food_facts' | 'ai'

/**
 * Food product with macronutrients stored per 100 g.
 */
export type Food = {
  id: string
  userId: string
  name: string
  calories: number
  protein: number
  fat: number
  carbs: number
  source: FoodSource
}
