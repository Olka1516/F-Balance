import {
  FOOD_SEARCH_DEFAULT_AMOUNT_G,
  FOOD_SOURCE_MANUAL,
  MEAL_TYPE_DEFAULT,
  MEAL_TYPES,
  type MealType,
} from '@/constants/meals'
import { AI_ESTIMATE_DEFAULT_NAME } from '@/constants/ai'
import type {
  Food,
  FoodSearchHit,
  FoodSource,
  ManualMealInput,
  Meal,
  MealFormValues,
  MealWithIngredients,
} from '@/types'
import {
  fromPerHundredGrams,
  macrosForAmount,
  macrosToPerHundred,
  roundNutrition,
} from '@/utils/macros'

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
  is_favorite?: boolean | null
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
    amount: String(FOOD_SEARCH_DEFAULT_AMOUNT_G),
    calories: '',
    protein: '',
    fat: '',
    carbs: '',
  }
}

/**
 * Fills meal form fields from an Open Food Facts hit.
 * The hit is per 100 g; the form holds values for the eaten portion.
 */
export function foodSearchHitToFormValues(
  hit: FoodSearchHit,
  mealType: MealType | '',
  amountGrams = FOOD_SEARCH_DEFAULT_AMOUNT_G,
): MealFormValues {
  return {
    name: hit.brand ? `${hit.name} (${hit.brand})` : hit.name,
    mealType: mealType || MEAL_TYPE_DEFAULT,
    amount: String(amountGrams),
    calories: portionString(hit.caloriesPer100g, amountGrams),
    protein: portionString(hit.proteinPer100g, amountGrams),
    fat: portionString(hit.fatPer100g, amountGrams),
    carbs: portionString(hit.carbsPer100g, amountGrams),
  }
}

/**
 * Builds editable form values from an AI nutrition estimate (already for the whole portion).
 */
export function aiEstimateToFormValues(input: {
  calories: number
  protein?: number | null
  fat?: number | null
  carbs?: number | null
  mealType: MealType | ''
  name?: string | null
  amountGrams?: number
}): MealFormValues {
  const amountGrams = input.amountGrams ?? FOOD_SEARCH_DEFAULT_AMOUNT_G

  return {
    name: (input.name ?? '').trim() || AI_ESTIMATE_DEFAULT_NAME,
    mealType: input.mealType || MEAL_TYPE_DEFAULT,
    amount: String(amountGrams),
    calories: String(roundNutrition(input.calories)),
    protein: String(roundNutrition(input.protein ?? 0)),
    fat: String(roundNutrition(input.fat ?? 0)),
    carbs: String(roundNutrition(input.carbs ?? 0)),
  }
}

/**
 * Whether a value is a known meal type.
 */
export function isMealType(value: string): value is MealType {
  return (MEAL_TYPES as readonly string[]).includes(value)
}

/**
 * Maps a meal with a single ingredient into editable portion values.
 */
export function mealToFormValues(meal: MealWithIngredients): MealFormValues {
  const ingredient = meal.ingredients[0]
  const amount = ingredient?.amount ?? meal.totalWeight
  const perHundred = ingredient
    ? {
        calories: ingredient.food.calories,
        protein: ingredient.food.protein,
        fat: ingredient.food.fat,
        carbs: ingredient.food.carbs,
      }
    : macrosToPerHundred(
        {
          calories: meal.calories,
          protein: meal.protein,
          fat: meal.fat,
          carbs: meal.carbs,
        },
        amount,
      )

  const portion = macrosForAmount(perHundred, amount)

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
 * Parses validated portion values into a manual meal input.
 * Empty macros count as 0; nutrition is converted to per-100 g for storage.
 */
export function formValuesToManualMealInput(
  values: MealFormValues,
  source: FoodSource = FOOD_SOURCE_MANUAL,
): ManualMealInput | null {
  if (!values.name.trim() || !isMealType(values.mealType)) {
    return null
  }

  const amountGrams = Number(values.amount)
  const portion = {
    calories: Number(values.calories),
    protein: Number(values.protein || 0),
    fat: Number(values.fat || 0),
    carbs: Number(values.carbs || 0),
  }

  if (
    !(amountGrams > 0) ||
    !Object.values(portion).every((value) => Number.isFinite(value))
  ) {
    return null
  }

  return {
    name: values.name.trim(),
    mealType: values.mealType,
    amountGrams,
    ...macrosToPerHundred(portion, amountGrams),
    source,
  }
}

/**
 * Builds per-100g food macros and meal totals from a manual input.
 * Input nutrition is already per 100 g; totals scale by amountGrams.
 */
export function buildManualMealNutrition(input: ManualMealInput) {
  const perHundred = {
    calories: input.calories,
    protein: input.protein,
    fat: input.fat,
    carbs: input.carbs,
  }
  const totals = macrosForAmount(perHundred, input.amountGrams)

  return {
    perHundred,
    totals,
    source: input.source ?? FOOD_SOURCE_MANUAL,
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
    isFavorite: Boolean(row.is_favorite),
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

function portionString(perHundred: number | null, amountGrams: number): string {
  return perHundred == null ? '' : String(fromPerHundredGrams(perHundred, amountGrams))
}

/**
 * Portion nutrition at a known weight, used as the fixed reference when the weight changes.
 */
export type PortionBasis = Pick<MealFormValues, 'calories' | 'protein' | 'fat' | 'carbs'> & {
  grams: number
}

/**
 * Captures the current portion as a scaling reference, or null when the weight is not positive.
 */
export function capturePortionBasis(values: MealFormValues): PortionBasis | null {
  const grams = Number(values.amount)

  if (!Number.isFinite(grams) || grams <= 0) {
    return null
  }

  return {
    grams,
    calories: values.calories,
    protein: values.protein,
    fat: values.fat,
    carbs: values.carbs,
  }
}

/**
 * Portion nutrition for a new weight at the same density as the reference portion:
 * value = reference value × new grams ÷ reference grams. Always computed from the
 * reference, never from the previous keystroke, so typing a weight does not compound.
 */
export function scalePortionFromBasis(
  basis: PortionBasis,
  toGrams: number,
): Pick<MealFormValues, 'calories' | 'protein' | 'fat' | 'carbs'> {
  const scale = (value: string) => {
    const parsed = Number(value)
    return value.trim() && Number.isFinite(parsed)
      ? String(roundNutrition((parsed * toGrams) / basis.grams))
      : value
  }

  return {
    calories: scale(basis.calories),
    protein: scale(basis.protein),
    fat: scale(basis.fat),
    carbs: scale(basis.carbs),
  }
}
