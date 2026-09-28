import type { SupabaseClient } from '@supabase/supabase-js'
import {
  DAILY_ENTRY_DEFAULT_SERVINGS,
} from '@/constants/meals'
import {
  getSupabase,
  getSupabaseReadiness,
  isSupabaseConnected,
} from '@/services/supabase'
import {
  createSupabaseFailure,
  mapSupabaseErrorCode,
} from '@/services/supabase/errors'
import type { DailyEntry, ManualMealInput, MealWithIngredients } from '@/types'
import {
  buildManualMealNutrition,
  mapMealWithIngredientsRow,
} from '@/utils/mealForm'

export type MealActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; code: string }

const MEAL_SELECT = `
  id,
  user_id,
  name,
  meal_type,
  total_weight,
  calories,
  protein,
  fat,
  carbs,
  updated_at,
  meal_ingredients (
    id,
    meal_id,
    food_id,
    amount,
    foods (
      id,
      user_id,
      name,
      calories,
      protein,
      fat,
      carbs,
      source
    )
  )
`

function getLiveSupabase(): SupabaseClient {
  if (!isSupabaseConnected()) {
    throw new Error('unavailable')
  }

  return getSupabase() as SupabaseClient
}

/**
 * Loads all saved meals for a user, newest first.
 */
export async function fetchUserMeals(
  userId: string,
): Promise<MealActionResult<MealWithIngredients[]>> {
  const readiness = getSupabaseReadiness()

  if (!readiness.ready) {
    return createSupabaseFailure(readiness.code)
  }

  const { data, error } = await getLiveSupabase()
    .from('meals')
    .select(MEAL_SELECT)
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })

  if (error) {
    return { ok: false, code: mapMealErrorCode(error) }
  }

  return {
    ok: true,
    data: (data ?? []).map((row) =>
      mapMealWithIngredientsRow(row as Parameters<typeof mapMealWithIngredientsRow>[0]),
    ),
  }
}

/**
 * Loads one meal with ingredients for editing.
 */
export async function fetchUserMeal(
  userId: string,
  mealId: string,
): Promise<MealActionResult<MealWithIngredients | null>> {
  const readiness = getSupabaseReadiness()

  if (!readiness.ready) {
    return createSupabaseFailure(readiness.code)
  }

  const { data, error } = await getLiveSupabase()
    .from('meals')
    .select(MEAL_SELECT)
    .eq('user_id', userId)
    .eq('id', mealId)
    .maybeSingle()

  if (error) {
    return { ok: false, code: mapMealErrorCode(error) }
  }

  if (!data) {
    return { ok: true, data: null }
  }

  return {
    ok: true,
    data: mapMealWithIngredientsRow(
      data as Parameters<typeof mapMealWithIngredientsRow>[0],
    ),
  }
}

/**
 * Creates a manual meal with a single food ingredient.
 */
export async function createManualMeal(
  userId: string,
  input: ManualMealInput,
): Promise<MealActionResult<MealWithIngredients>> {
  const readiness = getSupabaseReadiness()

  if (!readiness.ready) {
    return createSupabaseFailure(readiness.code)
  }

  const { perHundred, totals, source } = buildManualMealNutrition(input)
  const client = getLiveSupabase()

  const { data: food, error: foodError } = await client
    .from('foods')
    .insert({
      user_id: userId,
      name: input.name,
      calories: perHundred.calories,
      protein: perHundred.protein,
      fat: perHundred.fat,
      carbs: perHundred.carbs,
      source,
    })
    .select('id')
    .single()

  if (foodError || !food) {
    return { ok: false, code: mapMealErrorCode(foodError ?? { message: 'unknown' }) }
  }

  const { data: meal, error: mealError } = await client
    .from('meals')
    .insert({
      user_id: userId,
      name: input.name,
      meal_type: input.mealType,
      total_weight: input.amountGrams,
      calories: totals.calories,
      protein: totals.protein,
      fat: totals.fat,
      carbs: totals.carbs,
    })
    .select('id')
    .single()

  if (mealError || !meal) {
    await client.from('foods').delete().eq('id', food.id)
    return { ok: false, code: mapMealErrorCode(mealError ?? { message: 'unknown' }) }
  }

  const { error: ingredientError } = await client.from('meal_ingredients').insert({
    meal_id: meal.id,
    food_id: food.id,
    amount: input.amountGrams,
  })

  if (ingredientError) {
    await client.from('meals').delete().eq('id', meal.id)
    await client.from('foods').delete().eq('id', food.id)
    return { ok: false, code: mapMealErrorCode(ingredientError) }
  }

  return fetchRequiredMeal(userId, meal.id)
}

/**
 * Updates a manual single-ingredient meal and recalculates macros.
 */
export async function updateManualMeal(
  userId: string,
  mealId: string,
  input: ManualMealInput,
): Promise<MealActionResult<MealWithIngredients>> {
  const readiness = getSupabaseReadiness()

  if (!readiness.ready) {
    return createSupabaseFailure(readiness.code)
  }

  const existing = await fetchUserMeal(userId, mealId)

  if (!existing.ok) {
    return existing
  }

  if (!existing.data || existing.data.ingredients.length === 0) {
    return { ok: false, code: 'notFound' }
  }

  const ingredient = existing.data.ingredients[0]
  const { perHundred, totals, source } = buildManualMealNutrition(input)
  const client = getLiveSupabase()

  const { error: foodError } = await client
    .from('foods')
    .update({
      name: input.name,
      calories: perHundred.calories,
      protein: perHundred.protein,
      fat: perHundred.fat,
      carbs: perHundred.carbs,
      source,
    })
    .eq('id', ingredient.foodId)
    .eq('user_id', userId)

  if (foodError) {
    return { ok: false, code: mapMealErrorCode(foodError) }
  }

  const { error: mealError } = await client
    .from('meals')
    .update({
      name: input.name,
      meal_type: input.mealType,
      total_weight: input.amountGrams,
      calories: totals.calories,
      protein: totals.protein,
      fat: totals.fat,
      carbs: totals.carbs,
    })
    .eq('id', mealId)
    .eq('user_id', userId)

  if (mealError) {
    return { ok: false, code: mapMealErrorCode(mealError) }
  }

  const { error: ingredientError } = await client
    .from('meal_ingredients')
    .update({ amount: input.amountGrams })
    .eq('id', ingredient.id)

  if (ingredientError) {
    return { ok: false, code: mapMealErrorCode(ingredientError) }
  }

  return fetchRequiredMeal(userId, mealId)
}

/**
 * Deletes a saved meal owned by the user.
 */
export async function deleteUserMeal(
  userId: string,
  mealId: string,
): Promise<MealActionResult<null>> {
  const readiness = getSupabaseReadiness()

  if (!readiness.ready) {
    return createSupabaseFailure(readiness.code)
  }

  const { error } = await getLiveSupabase()
    .from('meals')
    .delete()
    .eq('id', mealId)
    .eq('user_id', userId)

  if (error) {
    return { ok: false, code: mapMealErrorCode(error) }
  }

  return { ok: true, data: null }
}

/**
 * Duplicates a meal with new food/ingredient rows.
 */
export async function duplicateUserMeal(
  userId: string,
  mealId: string,
  copyLabel: string,
): Promise<MealActionResult<MealWithIngredients>> {
  const existing = await fetchUserMeal(userId, mealId)

  if (!existing.ok) {
    return existing
  }

  if (!existing.data || existing.data.ingredients.length === 0) {
    return { ok: false, code: 'notFound' }
  }

  const source = existing.data
  const ingredient = source.ingredients[0]
  const portion = {
    name: `${source.name} (${copyLabel})`,
    mealType: source.mealType,
    amountGrams: ingredient.amount,
    calories: source.calories,
    protein: source.protein,
    fat: source.fat,
    carbs: source.carbs,
  }

  return createManualMeal(userId, portion)
}

/**
 * Logs a saved meal into today's daily entries.
 */
export async function addMealToToday(
  userId: string,
  mealId: string,
  date = formatLocalDate(new Date()),
  servings = DAILY_ENTRY_DEFAULT_SERVINGS,
): Promise<MealActionResult<DailyEntry>> {
  const readiness = getSupabaseReadiness()

  if (!readiness.ready) {
    return createSupabaseFailure(readiness.code)
  }

  const owned = await fetchUserMeal(userId, mealId)

  if (!owned.ok) {
    return owned
  }

  if (!owned.data) {
    return { ok: false, code: 'notFound' }
  }

  const { data, error } = await getLiveSupabase()
    .from('daily_entries')
    .insert({
      user_id: userId,
      meal_id: mealId,
      entry_date: date,
      amount: servings,
    })
    .select('id, user_id, meal_id, entry_date, amount, created_at')
    .single()

  if (error || !data) {
    return { ok: false, code: mapMealErrorCode(error ?? { message: 'unknown' }) }
  }

  return {
    ok: true,
    data: {
      id: data.id,
      userId: data.user_id,
      mealId: data.meal_id,
      date: data.entry_date,
      amount: Number(data.amount),
      createdAt: data.created_at,
    },
  }
}

/**
 * Formats a Date as YYYY-MM-DD in the local timezone.
 */
export function formatLocalDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

async function fetchRequiredMeal(
  userId: string,
  mealId: string,
): Promise<MealActionResult<MealWithIngredients>> {
  const result = await fetchUserMeal(userId, mealId)

  if (!result.ok) {
    return result
  }

  if (!result.data) {
    return { ok: false, code: 'notFound' }
  }

  return { ok: true, data: result.data }
}

function mapMealErrorCode(error: { message: string; code?: string }): string {
  const message = error.message.toLowerCase()

  if (error.code === '42P01' || message.includes('schema cache')) {
    return 'tableMissing'
  }

  if (error.code === '42501' || message.includes('row-level security')) {
    return 'permissionDenied'
  }

  return mapSupabaseErrorCode(error)
}
