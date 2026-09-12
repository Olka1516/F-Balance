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
      <div class="profile-form__chips" role="group">
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
      <AppInput
        v-model="form.dailyCalories"
        :label="t('common.profile.fields.dailyCalories')"
        :type="APP_INPUT_TYPE.number"
        :placeholder="t('common.profile.placeholders.optional')"
        :variant="inputVariant"
        :error="fieldErrors.dailyCalories"
      />
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRegle } from '@regle/core'
import { withMessage } from '@regle/rules'
import AppInput from '@/components/common/AppInput.vue'
import AppSelect from '@/components/common/AppSelect.vue'
import {
  ACTIVITY_LEVELS,
  PROFILE_AGE_MAX,
  PROFILE_AGE_MIN,
  PROFILE_DAILY_CALORIES_MAX,
  PROFILE_DAILY_CALORIES_MIN,
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
  APP_INPUT_TYPE,
  APP_INPUT_VARIANT,
  type AppInputVariant,
} from '@/constants/ui'
import type { ProfileFormValues } from '@/types'
import {
  isOptionalAgeValid,
  isOptionalDailyCaloriesValid,
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
})

/**
 * Validates the shared profile fields before save.
 */
async function validate(): Promise<boolean> {
  fieldErrors.goal = undefined
  fieldErrors.activityLevel = undefined
  fieldErrors.weight = undefined
  fieldErrors.height = undefined
  fieldErrors.age = undefined
  fieldErrors.dailyCalories = undefined

  const { valid } = await r$.$validate()

  fieldErrors.weight = r$.weight.$errors[0]
  fieldErrors.height = r$.height.$errors[0]
  fieldErrors.age = r$.age.$errors[0]
  fieldErrors.dailyCalories = r$.dailyCalories.$errors[0]

  return valid
}

defineExpose({
  validate,
})
</script>
