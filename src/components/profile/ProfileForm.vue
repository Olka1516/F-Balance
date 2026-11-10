<template>
  <div
    class="profile-form"
    :class="`profile-form--${variant ?? PROFILE_FORM_DEFAULT_VARIANT}`"
  >
    <section
      v-if="isOnboarding"
      class="profile-form__section"
      aria-labelledby="profile-form-goal"
    >
      <h2 id="profile-form-goal" class="profile-form__section-title">
        {{ t('common.profile.sections.goal') }}
      </h2>
      <div class="profile-form__chips profile-form__chips--three" role="group">
        <button
          v-for="option in goalOptions"
          :key="option.value"
          type="button"
          class="profile-form__chip"
          :class="{ 'profile-form__chip--active': form.goal === option.value }"
          @click="form.goal = option.value"
        >
          {{ option.label }}
        </button>
      </div>
    </section>

    <AppSelect
      v-else
      v-model="form.goal"
      :label="t('common.profile.fields.goal')"
      :placeholder="t('common.profile.placeholders.goal')"
      :options="goalOptions"
      :error="fieldErrors.goal"
    />

    <section
      v-if="changesWeight"
      class="profile-form__section"
      aria-labelledby="profile-form-pace"
    >
      <h2 id="profile-form-pace" class="profile-form__section-title">
        {{ t('common.profile.sections.pace') }}
      </h2>
      <div class="profile-form__chips profile-form__chips--three" role="group">
        <button
          v-for="option in paceOptions"
          :key="option.value"
          type="button"
          class="profile-form__chip profile-form__chip--compact"
          :class="{ 'profile-form__chip--active': form.pace === option.value }"
          @click="form.pace = option.value"
        >
          {{ option.label }}
        </button>
      </div>
    </section>

    <section class="profile-form__section" aria-labelledby="profile-form-sex">
      <h2 id="profile-form-sex" class="profile-form__section-title">
        {{ t('common.profile.sections.sex') }}
      </h2>
      <div class="profile-form__chips profile-form__chips--two" role="group">
        <button
          v-for="option in sexOptions"
          :key="option.value"
          type="button"
          class="profile-form__chip"
          :class="{ 'profile-form__chip--active': form.sex === option.value }"
          @click="form.sex = option.value"
        >
          {{ option.label }}
        </button>
      </div>
    </section>

    <section
      v-if="isOnboarding"
      class="profile-form__section"
      aria-labelledby="profile-form-activity"
    >
      <h2 id="profile-form-activity" class="profile-form__section-title">
        {{ t('common.profile.sections.activity') }}
      </h2>
      <div class="profile-form__chips profile-form__chips--wrap" role="group">
        <button
          v-for="option in activityOptions"
          :key="option.value"
          type="button"
          class="profile-form__chip profile-form__chip--compact"
          :class="{
            'profile-form__chip--active': form.activityLevel === option.value,
          }"
          @click="form.activityLevel = option.value"
        >
          {{ option.label }}
        </button>
      </div>
    </section>

    <AppSelect
      v-else
      v-model="form.activityLevel"
      :label="t('common.profile.fields.activityLevel')"
      :placeholder="t('common.profile.placeholders.activityLevel')"
      :options="activityOptions"
      :error="fieldErrors.activityLevel"
    />

    <section
      class="profile-form__section"
      :aria-labelledby="isOnboarding ? 'profile-form-body' : undefined"
    >
      <h2
        v-if="isOnboarding"
        id="profile-form-body"
        class="profile-form__section-title"
      >
        {{ t('common.profile.sections.body') }}
      </h2>
      <div class="profile-form__grid">
        <AppInput
          v-model="form.weight"
          :label="t('common.profile.fields.weight')"
          :type="APP_INPUT_TYPE.number"
          :placeholder="t('common.profile.placeholders.optional')"
          :variant="inputVariant"
          :error="fieldErrors.weight"
        />
        <AppInput
          v-if="changesWeight"
          v-model="form.targetWeight"
          :label="t('common.profile.fields.targetWeight')"
          :type="APP_INPUT_TYPE.number"
          :placeholder="t('common.profile.placeholders.optional')"
          :variant="inputVariant"
          :error="fieldErrors.targetWeight"
        />
        <AppInput
          v-model="form.height"
          :label="t('common.profile.fields.height')"
          :type="APP_INPUT_TYPE.number"
          :placeholder="t('common.profile.placeholders.optional')"
          :variant="inputVariant"
          :error="fieldErrors.height"
        />
        <AppInput
          v-model="form.age"
          :label="t('common.profile.fields.age')"
          :type="APP_INPUT_TYPE.number"
          :placeholder="t('common.profile.placeholders.optional')"
          :variant="inputVariant"
          :error="fieldErrors.age"
        />
      </div>
    </section>

    <section
      class="profile-form__section"
      :aria-labelledby="isOnboarding ? 'profile-form-target' : undefined"
    >
      <h2
        v-if="isOnboarding"
        id="profile-form-target"
        class="profile-form__section-title"
      >
        {{ t('common.profile.sections.target') }}
      </h2>
      <div class="profile-form__calc" aria-live="polite">
        <p class="profile-form__calc-title">
          {{ t('common.profile.calc.title') }}
        </p>
        <template v-if="targets">
          <p class="profile-form__calc-total">
            {{ t('common.profile.calc.total', { value: targets.calories }) }}
          </p>
          <p class="profile-form__calc-macros">
            {{
              t('common.profile.calc.macros', {
                protein: targets.protein,
                fat: targets.fat,
                carbs: targets.carbs,
              })
            }}
          </p>
          <ol class="profile-form__calc-steps">
            <li>{{ t('common.profile.calc.bmr', { value: targets.bmr }) }}</li>
            <li>
              {{
                t('common.profile.calc.maintenance', {
                  factor: targets.activityFactor,
                  value: targets.maintenance,
                })
              }}
            </li>
            <li v-if="targets.adjustmentPercent !== 0">
              {{
                t('common.profile.calc.adjustment', {
                  percent: formatPercent(targets.adjustmentPercent),
                  value: targets.calories,
                })
              }}
            </li>
            <li v-else>
              {{ t('common.profile.calc.maintain', { value: targets.calories }) }}
            </li>
          </ol>
          <AppButton
            type="button"
            :variant="APP_BUTTON_VARIANT.secondary"
            :disabled="isTargetsApplied"
            @click="applyTargets"
          >
            {{
              isTargetsApplied
                ? t('common.profile.calc.applied')
                : t('common.profile.calc.apply')
            }}
          </AppButton>
          <p class="profile-form__hint">{{ t('common.profile.calc.note') }}</p>
        </template>
        <p v-else class="profile-form__hint">
          {{ t('common.profile.calc.missing') }}
        </p>
      </div>
      <AppInput
        v-model="form.dailyCalories"
        :label="t('common.profile.fields.dailyCalories')"
        :type="APP_INPUT_TYPE.number"
        :placeholder="t('common.profile.placeholders.optional')"
        :variant="inputVariant"
        :error="fieldErrors.dailyCalories"
      />
    </section>

    <section
      class="profile-form__section"
      :aria-labelledby="isOnboarding ? 'profile-form-macros' : undefined"
    >
      <div class="profile-form__section-head">
        <h2
          v-if="isOnboarding"
          id="profile-form-macros"
          class="profile-form__section-title"
        >
          {{ t('common.profile.sections.macros') }}
        </h2>
        <p v-else class="profile-form__section-title">
          {{ t('common.profile.sections.macros') }}
        </p>
      </div>
      <p class="profile-form__hint">
        {{ t('common.profile.macrosHint') }}
      </p>
      <div class="profile-form__grid">
        <AppInput
          v-model="form.dailyProtein"
          :label="t('common.profile.fields.dailyProtein')"
          :type="APP_INPUT_TYPE.number"
          :placeholder="t('common.profile.placeholders.optional')"
          :variant="inputVariant"
          :error="fieldErrors.dailyProtein"
        />
        <AppInput
          v-model="form.dailyFat"
          :label="t('common.profile.fields.dailyFat')"
          :type="APP_INPUT_TYPE.number"
          :placeholder="t('common.profile.placeholders.optional')"
          :variant="inputVariant"
          :error="fieldErrors.dailyFat"
        />
        <AppInput
          v-model="form.dailyCarbs"
          :label="t('common.profile.fields.dailyCarbs')"
          :type="APP_INPUT_TYPE.number"
          :placeholder="t('common.profile.placeholders.optional')"
          :variant="inputVariant"
          :error="fieldErrors.dailyCarbs"
        />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRegle } from '@regle/core'
import { withMessage } from '@regle/rules'
import AppButton from '@/components/common/AppButton.vue'
import AppInput from '@/components/common/AppInput.vue'
import AppSelect from '@/components/common/AppSelect.vue'
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
  PROFILE_FORM_DEFAULT_VARIANT,
  PROFILE_FORM_VARIANT,
  PROFILE_HEIGHT_MAX_CM,
  PROFILE_HEIGHT_MIN_CM,
  PROFILE_WEIGHT_MAX_KG,
  PROFILE_WEIGHT_MIN_KG,
  USER_GOALS,
  type ProfileFormVariant,
} from '@/constants/profile'
import {
  APP_BUTTON_VARIANT,
  APP_INPUT_TYPE,
  APP_INPUT_VARIANT,
  type AppInputVariant,
} from '@/constants/ui'
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
  isOptionalTargetWeightValid,
  isOptionalAgeValid,
  isOptionalDailyCaloriesValid,
  isOptionalDailyCarbsValid,
  isOptionalDailyFatValid,
  isOptionalDailyProteinValid,
  isOptionalHeightValid,
  isOptionalWeightValid,
} from '@/utils/profileValidation'
import '@/styles/components/profile-form.css'

const props = withDefaults(
  defineProps<{
    variant?: ProfileFormVariant
  }>(),
  {
    variant: PROFILE_FORM_DEFAULT_VARIANT,
  },
)

const form = defineModel<ProfileFormValues>({ required: true })

const { t } = useI18n()

const fieldErrors = reactive<Partial<Record<keyof ProfileFormValues, string>>>(
  {},
)

const isOnboarding = computed(
  () => props.variant === PROFILE_FORM_VARIANT.onboarding,
)

const inputVariant = computed<AppInputVariant>(() =>
  isOnboarding.value
    ? APP_INPUT_VARIANT.underline
    : APP_INPUT_VARIANT.default,
)

const goalOptions = computed(() =>
  USER_GOALS.map((value) => ({
    value,
    label: t(`common.profile.goals.${value}`),
  })),
)

const activityOptions = computed(() =>
  ACTIVITY_LEVELS.map((value) => ({
    value,
    label: t(`common.profile.activity.${value}`),
  })),
)

const sexOptions = computed(() =>
  BIOLOGICAL_SEXES.map((value) => ({
    value,
    label: t(`common.profile.sex.${value}`),
  })),
)

const paceOptions = computed(() =>
  GOAL_PACES.map((value) => ({
    value,
    label: t(`common.profile.pace.${value}`),
  })),
)

const changesWeight = computed(
  () => form.value.goal === 'lose' || form.value.goal === 'gain',
)

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

let autoApplied = false

watch(targets, (current) => {
  if (current && isOnboarding.value && (hasNoTargets.value || autoApplied)) {
    applyTargets()
    autoApplied = true
  }
})

function validNumber(value: string, isValid: (value: string) => boolean): number | null {
  return value.trim() && isValid(value) ? parseOptionalNumber(value) : null
}

function formatPercent(value: number): string {
  return value > 0 ? `+${value}` : String(value)
}

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

watch(
  () =>
    [
      form.value.dailyProtein,
      form.value.dailyFat,
      form.value.dailyCarbs,
    ] as const,
  ([protein, fat, carbs]) => {
    if (!protein.trim() && !fat.trim() && !carbs.trim()) {
      return
    }

    if (!protein.trim() || !fat.trim() || !carbs.trim()) {
      return
    }

    const proteinGrams = parseOptionalNumber(protein)
    const fatGrams = parseOptionalNumber(fat)
    const carbsGrams = parseOptionalNumber(carbs)

    if (
      proteinGrams == null ||
      fatGrams == null ||
      carbsGrams == null ||
      proteinGrams < 0 ||
      fatGrams < 0 ||
      carbsGrams < 0
    ) {
      return
    }

    form.value.dailyCalories = String(
      caloriesFromMacros(proteinGrams, fatGrams, carbsGrams),
    )
  },
)

const { r$ } = useRegle(form, {
  weight: {
    range: withMessage(
      (value: string | null | undefined) =>
        isOptionalWeightValid(String(value ?? '')),
      () =>
        t('common.profile.validation.weightRange', {
          min: PROFILE_WEIGHT_MIN_KG,
          max: PROFILE_WEIGHT_MAX_KG,
        }),
    ),
  },
  targetWeight: {
    range: withMessage(
      (value: string | null | undefined) =>
        isOptionalTargetWeightValid(String(value ?? '')),
      () =>
        t('common.profile.validation.weightRange', {
          min: PROFILE_WEIGHT_MIN_KG,
          max: PROFILE_WEIGHT_MAX_KG,
        }),
    ),
  },
  height: {
    range: withMessage(
      (value: string | null | undefined) =>
        isOptionalHeightValid(String(value ?? '')),
      () =>
        t('common.profile.validation.heightRange', {
          min: PROFILE_HEIGHT_MIN_CM,
          max: PROFILE_HEIGHT_MAX_CM,
        }),
    ),
  },
  age: {
    range: withMessage(
      (value: string | null | undefined) =>
        isOptionalAgeValid(String(value ?? '')),
      () =>
        t('common.profile.validation.ageRange', {
          min: PROFILE_AGE_MIN,
          max: PROFILE_AGE_MAX,
        }),
    ),
  },
  dailyCalories: {
    range: withMessage(
      (value: string | null | undefined) =>
        isOptionalDailyCaloriesValid(String(value ?? '')),
      () =>
        t('common.profile.validation.caloriesRange', {
          min: PROFILE_DAILY_CALORIES_MIN,
          max: PROFILE_DAILY_CALORIES_MAX,
        }),
    ),
  },
  dailyProtein: {
    range: withMessage(
      (value: string | null | undefined) =>
        isOptionalDailyProteinValid(String(value ?? '')),
      () =>
        t('common.profile.validation.macroRange', {
          min: PROFILE_DAILY_MACRO_MIN_G,
          max: PROFILE_DAILY_PROTEIN_MAX_G,
        }),
    ),
  },
  dailyFat: {
    range: withMessage(
      (value: string | null | undefined) =>
        isOptionalDailyFatValid(String(value ?? '')),
      () =>
        t('common.profile.validation.macroRange', {
          min: PROFILE_DAILY_MACRO_MIN_G,
          max: PROFILE_DAILY_FAT_MAX_G,
        }),
    ),
  },
  dailyCarbs: {
    range: withMessage(
      (value: string | null | undefined) =>
        isOptionalDailyCarbsValid(String(value ?? '')),
      () =>
        t('common.profile.validation.macroRange', {
          min: PROFILE_DAILY_MACRO_MIN_G,
          max: PROFILE_DAILY_CARBS_MAX_G,
        }),
    ),
  },
})

/**
 * Validates the shared profile fields before save.
 */
async function validate(): Promise<boolean> {
  fieldErrors.goal = undefined
  fieldErrors.activityLevel = undefined
  fieldErrors.weight = undefined
  fieldErrors.targetWeight = undefined
  fieldErrors.height = undefined
  fieldErrors.age = undefined
  fieldErrors.dailyCalories = undefined
  fieldErrors.dailyProtein = undefined
  fieldErrors.dailyFat = undefined
  fieldErrors.dailyCarbs = undefined

  const { valid } = await r$.$validate()

  fieldErrors.weight = r$.weight.$errors[0]
  fieldErrors.targetWeight = r$.targetWeight.$errors[0]
  fieldErrors.height = r$.height.$errors[0]
  fieldErrors.age = r$.age.$errors[0]
  fieldErrors.dailyCalories = r$.dailyCalories.$errors[0]
  fieldErrors.dailyProtein = r$.dailyProtein.$errors[0]
  fieldErrors.dailyFat = r$.dailyFat.$errors[0]
  fieldErrors.dailyCarbs = r$.dailyCarbs.$errors[0]

  return valid
}

defineExpose({
  validate,
})
</script>
