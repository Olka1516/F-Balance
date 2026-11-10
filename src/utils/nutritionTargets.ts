import {
  MACRO_KCAL_CARBS,
  MACRO_KCAL_FAT,
  MACRO_KCAL_PROTEIN,
} from '@/constants/dashboard'
import {
  ACTIVITY_FACTORS,
  CALORIE_FLOOR_BY_SEX,
  DEFAULT_GOAL_PACE,
  FAT_G_PER_KG_MIN,
  FAT_SHARE_MIN,
  GOAL_PACE_ADJUSTMENT,
  MIFFLIN_SEX_OFFSET,
  PROTEIN_G_PER_KG_BY_GOAL,
} from '@/constants/profile'
import type { ActivityLevel, BiologicalSex, GoalPace, UserGoal } from '@/types'

/**
 * Inputs required to calculate daily targets.
 */
export type NutritionTargetInput = {
  sex: BiologicalSex
  age: number
  weight: number
  height: number
  activityLevel: ActivityLevel
  goal: UserGoal
  pace: GoalPace
}

/**
 * Calculated daily targets with the intermediate steps shown to the user.
 */
export type NutritionTargets = {
  bmr: number
  maintenance: number
  activityFactor: number
  adjustmentPercent: number
  calories: number
  protein: number
  fat: number
  carbs: number
}

/**
 * Basal metabolic rate by the Mifflin–St Jeor equation, in kcal.
 */
export function calculateBmr(
  input: Pick<NutritionTargetInput, 'sex' | 'age' | 'weight' | 'height'>,
): number {
  return 10 * input.weight + 6.25 * input.height - 5 * input.age + MIFFLIN_SEX_OFFSET[input.sex]
}

/**
 * Daily calorie and macro targets: BMR → maintenance (× activity) → goal adjustment by pace,
 * then protein and fat by body weight and carbs as the remainder.
 */
export function calculateNutritionTargets(input: NutritionTargetInput): NutritionTargets {
  const bmr = calculateBmr(input)
  const activityFactor = ACTIVITY_FACTORS[input.activityLevel]
  const maintenance = bmr * activityFactor
  const adjustmentPercent = input.goal === 'maintain' ? 0 : GOAL_PACE_ADJUSTMENT[input.goal][input.pace]
  const floor = Math.max(bmr, CALORIE_FLOOR_BY_SEX[input.sex])
  const calories = Math.round(Math.max(maintenance * (1 + adjustmentPercent / 100), floor))

  const protein = Math.round(input.weight * PROTEIN_G_PER_KG_BY_GOAL[input.goal])
  const fat = Math.round(
    Math.max(input.weight * FAT_G_PER_KG_MIN, (calories * FAT_SHARE_MIN) / MACRO_KCAL_FAT),
  )
  const carbs = Math.max(
    0,
    Math.round((calories - protein * MACRO_KCAL_PROTEIN - fat * MACRO_KCAL_FAT) / MACRO_KCAL_CARBS),
  )

  return {
    bmr: Math.round(bmr),
    maintenance: Math.round(maintenance),
    activityFactor,
    adjustmentPercent,
    calories,
    protein,
    fat,
    carbs,
  }
}

/**
 * Returns targets when every required input is present, otherwise null.
 * Pace defaults to normal when the goal is not maintenance and pace is not chosen yet.
 */
export function tryCalculateNutritionTargets(
  input: { [K in keyof NutritionTargetInput]: NutritionTargetInput[K] | null },
): NutritionTargets | null {
  const { sex, age, weight, height, activityLevel, goal } = input

  if (!sex || !age || !weight || !height || !activityLevel || !goal) {
    return null
  }

  return calculateNutritionTargets({
    sex,
    age,
    weight,
    height,
    activityLevel,
    goal,
    pace: input.pace ?? DEFAULT_GOAL_PACE,
  })
}
