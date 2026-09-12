/**
 * Link between a saved meal and a food item with a portion amount.
 */
export type MealIngredient = {
  mealId: string
  foodId: string
  amount: number
}
