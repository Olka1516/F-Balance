<template>
  <div class="profile-form profile-form--onboarding">
    <section class="profile-form__section" aria-labelledby="profile-form-goal"
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

    <section class="profile-form__section" aria-labelledby="profile-form-activity"
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


    <section
      class="profile-form__section"
      aria-labelledby="profile-form-body"
    >
      <h2
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
          :variant="APP_INPUT_VARIANT.underline"
          :error="fieldErrors.weight"
        />
        <AppInput
          v-if="changesWeight"
          v-model="form.targetWeight"
          :label="t('common.profile.fields.targetWeight')"
          :type="APP_INPUT_TYPE.number"
          :placeholder="t('common.profile.placeholders.optional')"
          :variant="APP_INPUT_VARIANT.underline"
          :error="fieldErrors.targetWeight"
        />
        <AppInput
          v-model="form.height"
          :label="t('common.profile.fields.height')"
          :type="APP_INPUT_TYPE.number"
          :placeholder="t('common.profile.placeholders.optional')"
          :variant="APP_INPUT_VARIANT.underline"
          :error="fieldErrors.height"
        />
        <AppInput
          v-model="form.age"
          :label="t('common.profile.fields.age')"
          :type="APP_INPUT_TYPE.number"
          :placeholder="t('common.profile.placeholders.optional')"
          :variant="APP_INPUT_VARIANT.underline"
          :error="fieldErrors.age"
        />
      </div>
    </section>

    <section
      class="profile-form__section"
      aria-labelledby="profile-form-target"
    >
      <h2
        id="profile-form-target"
        class="profile-form__section-title"
      >
        {{ t('common.profile.sections.target') }}
      </h2>
      <div class="profile-form__calc" aria-live="polite">
        <div class="profile-form__calc-head">
          <p class="profile-form__calc-title">
            {{ t('common.profile.calc.title') }}
          </p>
          <button
            v-if="targets"
            type="button"
            class="profile-form__calc-info"
            :aria-expanded="showCalcSteps"
            :aria-label="t('common.profile.calc.how')"
            :title="calcStepsText"
            @click="showCalcSteps = !showCalcSteps"
          >
            ?
          </button>
        </div>
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
          <ol v-if="showCalcSteps" class="profile-form__calc-steps">
            <li v-for="step in calcSteps" :key="step">{{ step }}</li>
          </ol>
          <AppButton
            v-if="!isTargetsApplied"
            type="button"
            :variant="APP_BUTTON_VARIANT.secondary"
            @click="applyTargets"
          >
            {{ t('common.profile.calc.apply') }}
          </AppButton>
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
        :variant="APP_INPUT_VARIANT.underline"
        :error="fieldErrors.dailyCalories"
      />
    </section>

    <section
      class="profile-form__section"
      aria-labelledby="profile-form-macros"
    >
      <div class="profile-form__section-head">
        <h2 id="profile-form-macros" class="profile-form__section-title">
          {{ t('common.profile.sections.macros') }}
        </h2>
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
          :variant="APP_INPUT_VARIANT.underline"
          :error="fieldErrors.dailyProtein"
        />
        <AppInput
          v-model="form.dailyFat"
          :label="t('common.profile.fields.dailyFat')"
          :type="APP_INPUT_TYPE.number"
          :placeholder="t('common.profile.placeholders.optional')"
          :variant="APP_INPUT_VARIANT.underline"
          :error="fieldErrors.dailyFat"
        />
        <AppInput
          v-model="form.dailyCarbs"
          :label="t('common.profile.fields.dailyCarbs')"
          :type="APP_INPUT_TYPE.number"
          :placeholder="t('common.profile.placeholders.optional')"
          :variant="APP_INPUT_VARIANT.underline"
          :error="fieldErrors.dailyCarbs"
        />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import AppButton from '@/components/common/AppButton.vue'
import AppInput from '@/components/common/AppInput.vue'
import { useProfileForm } from '@/composables/useProfileForm'
import { APP_BUTTON_VARIANT, APP_INPUT_TYPE, APP_INPUT_VARIANT } from '@/constants/ui'
import type { ProfileFormValues } from '@/types'
import '@/styles/components/profile-form.css'

const form = defineModel<ProfileFormValues>({ required: true })

const { t } = useI18n()
const autoApply = ref(false)

const {
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
} = useProfileForm(form, { autoApply })

watch(
  hasNoTargets,
  (empty) => {
    if (empty) {
      autoApply.value = true
    }
  },
  { immediate: true },
)

const showCalcSteps = ref(false)

const calcSteps = computed(() => {
  const current = targets.value

  if (!current) {
    return []
  }

  return [
    t('common.profile.calc.bmr', { value: current.bmr }),
    t('common.profile.calc.maintenance', {
      factor: current.activityFactor,
      value: current.maintenance,
    }),
    current.adjustmentPercent !== 0
      ? t('common.profile.calc.adjustment', {
          percent: current.adjustmentPercent > 0 ? `+${current.adjustmentPercent}` : String(current.adjustmentPercent),
          value: current.calories,
        })
      : t('common.profile.calc.maintain', { value: current.calories }),
  ]
})

const calcStepsText = computed(() => calcSteps.value.join('\n'))

defineExpose({ validate })
</script>
