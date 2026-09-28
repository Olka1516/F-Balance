/**
 * Link between a saved meal and a food item with a portion amount in grams.
 */
export type MealIngredient = {
  id: string
  mealId: string
  foodId: string
  amount: number
}
