import {
  FOOD_SOURCE_MANUAL,
  MEAL_TYPE_DEFAULT,
  MEAL_TYPES,
  type MealType,
} from '@/constants/meals'
import type {
  Food,
  ManualMealInput,
  Meal,
  MealFormValues,
  MealWithIngredients,
} from '@/types'
import { macrosForAmount, macrosToPerHundred } from '@/utils/macros'

type FoodRow = {
  id: string
  user_id: string
  name: string
  calories: number | string
  protein: number | string
  fat: number | string
  carbs: number | string
  source: string
}

type MealRow = {
  id: string
  user_id: string
  name: string
  meal_type: string
  total_weight: number | string
  calories: number | string
  protein: number | string
  fat: number | string
  carbs: number | string
  updated_at: string
}

type IngredientRow = {
  id: string
  meal_id: string
  food_id: string
  amount: number | string
  foods?: FoodRow | FoodRow[] | null
}

/**
 * Empty manual meal form values.
 */
export function createEmptyMealForm(): MealFormValues {
  return {
    name: '',
    mealType: MEAL_TYPE_DEFAULT,
    amount: '100',
    calories: '',
    protein: '',
    fat: '',
    carbs: '',
  }
}

/**
 * Whether a value is a known meal type.
 */
export function isMealType(value: string): value is MealType {
  return (MEAL_TYPES as readonly string[]).includes(value)
}

/**
 * Maps a meal with a single ingredient into editable form values.
 */
export function mealToFormValues(meal: MealWithIngredients): MealFormValues {
  const ingredient = meal.ingredients[0]
  const amount = ingredient?.amount ?? meal.totalWeight
  const portion = ingredient
    ? macrosForAmount(
        {
          calories: ingredient.food.calories,
          protein: ingredient.food.protein,
          fat: ingredient.food.fat,
          carbs: ingredient.food.carbs,
        },
        amount,
      )
    : {
        calories: meal.calories,
        protein: meal.protein,
        fat: meal.fat,
        carbs: meal.carbs,
      }

  return {
    name: meal.name,
    mealType: meal.mealType,
    amount: String(amount),
    calories: String(portion.calories),
    protein: String(portion.protein),
    fat: String(portion.fat),
    carbs: String(portion.carbs),
  }
}

/**
 * Parses validated form strings into a manual meal input.
 */
export function formValuesToManualMealInput(
  values: MealFormValues,
): ManualMealInput | null {
  if (!values.name.trim() || !isMealType(values.mealType)) {
    return null
  }

  const amountGrams = Number(values.amount)
  const calories = Number(values.calories)
  const protein = Number(values.protein)
  const fat = Number(values.fat)
  const carbs = Number(values.carbs)

  if (
    ![amountGrams, calories, protein, fat, carbs].every((value) =>
      Number.isFinite(value),
    )
  ) {
    return null
  }

  return {
    name: values.name.trim(),
    mealType: values.mealType,
    amountGrams,
    calories,
    protein,
    fat,
    carbs,
  }
}

/**
 * Builds per-100g food macros and meal totals from a manual input.
 */
export function buildManualMealNutrition(input: ManualMealInput) {
  const perHundred = macrosToPerHundred(
    {
      calories: input.calories,
      protein: input.protein,
      fat: input.fat,
      carbs: input.carbs,
    },
    input.amountGrams,
  )
  const totals = macrosForAmount(perHundred, input.amountGrams)

  return {
    perHundred,
    totals,
    source: FOOD_SOURCE_MANUAL,
  }
}

/**
 * Maps a food database row to the app type.
 */
export function mapFoodRow(row: FoodRow): Food {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    calories: Number(row.calories),
    protein: Number(row.protein),
    fat: Number(row.fat),
    carbs: Number(row.carbs),
    source:
      row.source === 'open_food_facts' || row.source === 'ai'
        ? row.source
        : 'manual',
  }
}

/**
 * Maps a meal database row to the app type.
 */
export function mapMealRow(row: MealRow): Meal {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    mealType: isMealType(row.meal_type) ? row.meal_type : MEAL_TYPE_DEFAULT,
    totalWeight: Number(row.total_weight),
    calories: Number(row.calories),
    protein: Number(row.protein),
    fat: Number(row.fat),
    carbs: Number(row.carbs),
    updatedAt: row.updated_at,
  }
}

/**
 * Maps nested meal + ingredient rows from Supabase.
 */
export function mapMealWithIngredientsRow(
  row: MealRow & { meal_ingredients?: IngredientRow[] | null },
): MealWithIngredients {
  const ingredients = (row.meal_ingredients ?? []).map((ingredient) => {
    const foodRow = Array.isArray(ingredient.foods)
      ? ingredient.foods[0]
      : ingredient.foods

    return {
      id: ingredient.id,
      mealId: ingredient.meal_id,
      foodId: ingredient.food_id,
      amount: Number(ingredient.amount),
      food: foodRow
        ? mapFoodRow(foodRow)
        : {
            id: ingredient.food_id,
            userId: row.user_id,
            name: row.name,
            calories: 0,
            protein: 0,
            fat: 0,
            carbs: 0,
            source: 'manual' as const,
          },
    }
  })

  return {
    ...mapMealRow(row),
    ingredients,
  }
}

/**
 * Builds a duplicated meal name.
 */
export function buildDuplicatedMealName(name: string, copyLabel: string): string {
  return `${name} (${copyLabel})`
}
