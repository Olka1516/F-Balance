import type { MealType } from '@/constants/meals'

/**
 * User-created meal composed of one or more ingredients.
 */
export type Meal = {
  id: string
  userId: string
  name: string
  mealType: MealType
  totalWeight: number
  calories: number
  protein: number
  fat: number
  carbs: number
}
