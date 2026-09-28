<template>
  <div class="meal-form">
    <AppInput
      v-model="form.name"
      :label="t('meals.fields.name')"
      :type="APP_INPUT_TYPE.text"
      :error="fieldErrors.name"
    />

    <section class="meal-form__section" aria-labelledby="meal-form-type">
      <h2 id="meal-form-type" class="meal-form__section-title">
        {{ t('meals.fields.mealType') }}
      </h2>
      <div class="meal-form__chips" role="group">
        <button
          v-for="type in MEAL_TYPES"
          :key="type"
          type="button"
          class="meal-form__chip"
          :class="{ 'meal-form__chip--active': form.mealType === type }"
          @click="form.mealType = type"
        >
          {{ t(`meals.${type}`) }}
        </button>
      </div>
      <p v-if="fieldErrors.mealType" class="meal-form__error" role="alert">
        {{ fieldErrors.mealType }}
      </p>
    </section>

    <div class="meal-form__grid">
      <AppInput
        v-model="form.amount"
        :label="t('meals.fields.amount')"
        :type="APP_INPUT_TYPE.number"
        :error="fieldErrors.amount"
      />
      <AppInput
        v-model="form.calories"
        :label="t('meals.fields.calories')"
        :type="APP_INPUT_TYPE.number"
        :error="fieldErrors.calories"
      />
    </div>

    <div class="meal-form__grid meal-form__grid--macros">
      <AppInput
        v-model="form.protein"
        :label="t('meals.fields.protein')"
        :type="APP_INPUT_TYPE.number"
        :error="fieldErrors.protein"
      />
      <AppInput
        v-model="form.fat"
        :label="t('meals.fields.fat')"
        :type="APP_INPUT_TYPE.number"
        :error="fieldErrors.fat"
      />
      <AppInput
        v-model="form.carbs"
        :label="t('meals.fields.carbs')"
        :type="APP_INPUT_TYPE.number"
        :error="fieldErrors.carbs"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRegle } from '@regle/core'
import { maxLength, minLength, required, withMessage } from '@regle/rules'
import AppInput from '@/components/common/AppInput.vue'
import {
  MEAL_AMOUNT_MAX_G,
  MEAL_AMOUNT_MIN_G,
  MEAL_CALORIES_MAX,
  MEAL_CALORIES_MIN,
  MEAL_MACRO_MAX,
  MEAL_MACRO_MIN,
  MEAL_NAME_MAX_LENGTH,
  MEAL_NAME_MIN_LENGTH,
  MEAL_TYPES,
} from '@/constants/meals'
import { APP_INPUT_TYPE } from '@/constants/ui'
import type { MealFormValues } from '@/types'
import { isMealType } from '@/utils/mealForm'
import '@/styles/components/meal-form.css'

const form = defineModel<MealFormValues>({ required: true })

const { t } = useI18n()

const fieldErrors = reactive<Partial<Record<keyof MealFormValues, string>>>({})

function isNumberInRange(
  value: string | null | undefined,
  min: number,
  max: number,
): boolean {
  if (value == null || !String(value).trim()) {
    return false
  }

  const parsed = Number(value)

  return Number.isFinite(parsed) && parsed >= min && parsed <= max
}

const { r$ } = useRegle(form, {
  name: {
    required: withMessage(required, () => t('meals.validation.required')),
    minLength: withMessage(minLength(MEAL_NAME_MIN_LENGTH), () =>
      t('meals.validation.required'),
    ),
    maxLength: withMessage(maxLength(MEAL_NAME_MAX_LENGTH), () =>
      t('meals.validation.nameMax', { max: MEAL_NAME_MAX_LENGTH }),
    ),
  },
  mealType: {
    required: withMessage(
      (value: string | null | undefined) => isMealType(String(value ?? '')),
      () => t('meals.validation.required'),
    ),
  },
  amount: {
    range: withMessage(
      (value: string | null | undefined) =>
        isNumberInRange(value, MEAL_AMOUNT_MIN_G, MEAL_AMOUNT_MAX_G),
      () =>
        t('meals.validation.amountRange', {
          min: MEAL_AMOUNT_MIN_G,
          max: MEAL_AMOUNT_MAX_G,
        }),
    ),
  },
  calories: {
    range: withMessage(
      (value: string | null | undefined) =>
        isNumberInRange(value, MEAL_CALORIES_MIN, MEAL_CALORIES_MAX),
      () =>
        t('meals.validation.caloriesRange', {
          min: MEAL_CALORIES_MIN,
          max: MEAL_CALORIES_MAX,
        }),
    ),
  },
  protein: {
    range: withMessage(
      (value: string | null | undefined) =>
        isNumberInRange(value, MEAL_MACRO_MIN, MEAL_MACRO_MAX),
      () =>
        t('meals.validation.macroRange', {
          min: MEAL_MACRO_MIN,
          max: MEAL_MACRO_MAX,
        }),
    ),
  },
  fat: {
    range: withMessage(
      (value: string | null | undefined) =>
        isNumberInRange(value, MEAL_MACRO_MIN, MEAL_MACRO_MAX),
      () =>
        t('meals.validation.macroRange', {
          min: MEAL_MACRO_MIN,
          max: MEAL_MACRO_MAX,
        }),
    ),
  },
  carbs: {
    range: withMessage(
      (value: string | null | undefined) =>
        isNumberInRange(value, MEAL_MACRO_MIN, MEAL_MACRO_MAX),
      () =>
        t('meals.validation.macroRange', {
          min: MEAL_MACRO_MIN,
          max: MEAL_MACRO_MAX,
        }),
    ),
  },
})

/**
 * Validates the manual meal form before save.
 */
async function validate(): Promise<boolean> {
  fieldErrors.name = undefined
  fieldErrors.mealType = undefined
  fieldErrors.amount = undefined
  fieldErrors.calories = undefined
  fieldErrors.protein = undefined
  fieldErrors.fat = undefined
  fieldErrors.carbs = undefined

  const { valid } = await r$.$validate()

  fieldErrors.name = r$.name.$errors[0]
  fieldErrors.mealType = r$.mealType.$errors[0]
  fieldErrors.amount = r$.amount.$errors[0]
  fieldErrors.calories = r$.calories.$errors[0]
  fieldErrors.protein = r$.protein.$errors[0]
  fieldErrors.fat = r$.fat.$errors[0]
  fieldErrors.carbs = r$.carbs.$errors[0]

  return valid
}

defineExpose({
  validate,
})
</script>
