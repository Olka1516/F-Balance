import { computed, reactive, watch, type Ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRegle } from '@regle/core'
import { withMessage } from '@regle/rules'
import {
  ACTIVITY_LEVELS,
  BIOLOGICAL_SEXES,
  GOAL_PACES,
  PROFILE_AGE_MAX,
  PROFILE_AGE_MIN,
  PROFILE_DAILY_CALORIES_MAX,
  PROFILE_DAILY_CALORIES_MIN,
  PROFILE_DAILY_CARBS_MAX_G,
  PROFILE_DAILY_FAT_MAX_G,
  PROFILE_DAILY_MACRO_MIN_G,
  PROFILE_DAILY_PROTEIN_MAX_G,
  PROFILE_HEIGHT_MAX_CM,
  PROFILE_HEIGHT_MIN_CM,
  PROFILE_WEIGHT_MAX_KG,
  PROFILE_WEIGHT_MIN_KG,
  USER_GOALS,
} from '@/constants/profile'
import type { ProfileFormValues } from '@/types'
import { caloriesFromMacros } from '@/utils/macros'
import { tryCalculateNutritionTargets } from '@/utils/nutritionTargets'
import {
  isActivityLevel,
  isBiologicalSex,
  isGoalPace,
  isUserGoal,
  parseOptionalNumber,
} from '@/utils/profileForm'
import {
  isOptionalAgeValid,
  isOptionalDailyCaloriesValid,
  isOptionalDailyCarbsValid,
  isOptionalDailyFatValid,
  isOptionalDailyProteinValid,
  isOptionalHeightValid,
  isOptionalTargetWeightValid,
  isOptionalWeightValid,
} from '@/utils/profileValidation'

type ValidatedField =
  | 'weight'
  | 'targetWeight'
  | 'height'
  | 'age'
  | 'dailyCalories'
  | 'dailyProtein'
  | 'dailyFat'
  | 'dailyCarbs'

const VALIDATED_FIELDS: ValidatedField[] = [
  'weight',
  'targetWeight',
  'height',
  'age',
  'dailyCalories',
  'dailyProtein',
  'dailyFat',
  'dailyCarbs',
]

/**
 * Shared profile form logic for Onboarding and Profile: option lists,
 * calorie and macro targets from body data, auto-applying those targets,
 * recalculating calories from edited macros, and range validation.
 */
export function useProfileForm(form: Ref<ProfileFormValues>, options: { autoApply: Ref<boolean> }) {
  const { t } = useI18n()
  const fieldErrors = reactive<Partial<Record<keyof ProfileFormValues, string>>>({})

  const goalOptions = computed(() =>
    USER_GOALS.map((value) => ({ value, label: t(`common.profile.goals.${value}`) })),
  )
  const activityOptions = computed(() =>
    ACTIVITY_LEVELS.map((value) => ({
      value,
      label: t(`common.profile.activity.${value}`),
      hint: t(`common.profile.activityHints.${value}`),
    })),
  )
  const sexOptions = computed(() =>
    BIOLOGICAL_SEXES.map((value) => ({ value, label: t(`common.profile.sex.${value}`) })),
  )
  const paceOptions = computed(() =>
    GOAL_PACES.map((value) => ({ value, label: t(`common.profile.pace.${value}`) })),
  )

  const changesWeight = computed(() => form.value.goal === 'lose' || form.value.goal === 'gain')

  const targets = computed(() => {
    const values = form.value

    return tryCalculateNutritionTargets({
      sex: isBiologicalSex(values.sex) ? values.sex : null,
      age: validNumber(values.age, isOptionalAgeValid),
      weight: validNumber(values.weight, isOptionalWeightValid),
      height: validNumber(values.height, isOptionalHeightValid),
      activityLevel: isActivityLevel(values.activityLevel) ? values.activityLevel : null,
      goal: isUserGoal(values.goal) ? values.goal : null,
      pace: isGoalPace(values.pace) ? values.pace : null,
    })
  })

  const isTargetsApplied = computed(() => {
    const current = targets.value

    return (
      current != null &&
      form.value.dailyCalories === String(current.calories) &&
      form.value.dailyProtein === String(current.protein) &&
      form.value.dailyFat === String(current.fat) &&
      form.value.dailyCarbs === String(current.carbs)
    )
  })

  const hasNoTargets = computed(
    () =>
      !form.value.dailyCalories.trim() &&
      !form.value.dailyProtein.trim() &&
      !form.value.dailyFat.trim() &&
      !form.value.dailyCarbs.trim(),
  )

  function validNumber(value: string, isValid: (value: string) => boolean): number | null {
    return value.trim() && isValid(value) ? parseOptionalNumber(value) : null
  }

  /**
   * Copies the calculated calorie and macro targets into the form.
   */
  function applyTargets(): void {
    const current = targets.value

    if (!current) {
      return
    }

    form.value.dailyCalories = String(current.calories)
    form.value.dailyProtein = String(current.protein)
    form.value.dailyFat = String(current.fat)
    form.value.dailyCarbs = String(current.carbs)
  }

  watch(targets, (current) => {
    if (current && options.autoApply.value) {
      applyTargets()
    }
  })

  watch(
    () => [form.value.dailyProtein, form.value.dailyFat, form.value.dailyCarbs] as const,
    ([protein, fat, carbs]) => {
      if (!protein.trim() || !fat.trim() || !carbs.trim()) {
        return
      }

      const grams = [protein, fat, carbs].map(parseOptionalNumber)

      if (grams.some((value) => value == null || value < 0)) {
        return
      }

      const [proteinGrams, fatGrams, carbsGrams] = grams as number[]
      form.value.dailyCalories = String(caloriesFromMacros(proteinGrams, fatGrams, carbsGrams))
    },
  )

  const rangeRule = (
    isValid: (value: string) => boolean,
    message: () => string,
  ) => ({
    range: withMessage((value: string | null | undefined) => isValid(String(value ?? '')), message),
  })

  const weightMessage = () =>
    t('common.profile.validation.weightRange', { min: PROFILE_WEIGHT_MIN_KG, max: PROFILE_WEIGHT_MAX_KG })
  const macroMessage = (max: number) => () =>
    t('common.profile.validation.macroRange', { min: PROFILE_DAILY_MACRO_MIN_G, max })

  const { r$ } = useRegle(form, {
    weight: rangeRule(isOptionalWeightValid, weightMessage),
    targetWeight: rangeRule(isOptionalTargetWeightValid, weightMessage),
    height: rangeRule(isOptionalHeightValid, () =>
      t('common.profile.validation.heightRange', { min: PROFILE_HEIGHT_MIN_CM, max: PROFILE_HEIGHT_MAX_CM }),
    ),
    age: rangeRule(isOptionalAgeValid, () =>
      t('common.profile.validation.ageRange', { min: PROFILE_AGE_MIN, max: PROFILE_AGE_MAX }),
    ),
    dailyCalories: rangeRule(isOptionalDailyCaloriesValid, () =>
      t('common.profile.validation.caloriesRange', {
        min: PROFILE_DAILY_CALORIES_MIN,
        max: PROFILE_DAILY_CALORIES_MAX,
      }),
    ),
    dailyProtein: rangeRule(isOptionalDailyProteinValid, macroMessage(PROFILE_DAILY_PROTEIN_MAX_G)),
    dailyFat: rangeRule(isOptionalDailyFatValid, macroMessage(PROFILE_DAILY_FAT_MAX_G)),
    dailyCarbs: rangeRule(isOptionalDailyCarbsValid, macroMessage(PROFILE_DAILY_CARBS_MAX_G)),
  })

  /**
   * Validates body data and daily targets; fills `fieldErrors` with the first message per field.
   */
  async function validate(): Promise<boolean> {
    const { valid } = await r$.$validate()

    for (const field of VALIDATED_FIELDS) {
      fieldErrors[field] = r$[field].$errors[0]
    }

    return valid
  }

  return {
    fieldErrors,
    goalOptions,
    activityOptions,
    sexOptions,
    paceOptions,
    changesWeight,
    targets,
    isTargetsApplied,
    hasNoTargets,
    applyTargets,
    validate,
  }
}
