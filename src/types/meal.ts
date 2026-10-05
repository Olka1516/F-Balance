import type { MealType } from '@/constants/meals'
import type { Food, FoodSource } from './food'
import type { MealIngredient } from './mealIngredient'

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
  updatedAt: string
}

/**
 * Meal with nested ingredients and food details.
 */
export type MealWithIngredients = Meal & {
  ingredients: Array<MealIngredient & { food: Food }>
}

/**
 * Manual meal form values as strings for inputs.
 * Nutrition fields are per 100 g; amount is the eaten portion in grams.
 */
export type MealFormValues = {
  name: string
  mealType: MealType | ''
  amount: string
  calories: string
  protein: string
  fat: string
  carbs: string
}

/**
 * Parsed manual meal payload ready for persistence.
 * Nutrition fields are densities per 100 g; amountGrams is the eaten portion.
 */
export type ManualMealInput = {
  name: string
  mealType: MealType
  amountGrams: number
  calories: number
  protein: number
  fat: number
  carbs: number
  source?: FoodSource
}
