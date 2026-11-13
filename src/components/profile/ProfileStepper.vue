<template>
  <div class="profile-stepper">
    <label class="profile-stepper__label" :for="inputId">{{ label }}</label>
    <div class="profile-stepper__controls">
      <button
        type="button"
        class="profile-stepper__button"
        :aria-label="t('common.profile.decrease', { field: label })"
        @click="shift(-step)"
      >
        −
      </button>
      <span class="profile-stepper__field">
        <input
          :id="inputId"
          v-model="value"
          class="profile-stepper__input"
          :style="{ width: inputWidth }"
          type="number"
          inputmode="decimal"
          :min="min"
          :max="max"
          :step="step"
          :placeholder="t('common.profile.placeholders.empty')"
          :aria-invalid="Boolean(error)"
        />
        <span class="profile-stepper__unit" aria-hidden="true">{{ unit }}</span>
      </span>
      <button
        type="button"
        class="profile-stepper__button"
        :aria-label="t('common.profile.increase', { field: label })"
        @click="shift(step)"
      >
        +
      </button>
    </div>
    <p v-if="error" class="profile-stepper__error" role="alert">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed, useId } from 'vue'
import { useI18n } from 'vue-i18n'
import { parseOptionalNumber } from '@/utils/profileForm'
import '@/styles/components/profile-stepper.css'

const props = defineProps<{
  label: string
  unit: string
  step: number
  min: number
  max: number
  start: number
  error?: string
}>()

const value = defineModel<string>({ required: true })

const { t } = useI18n()
const inputId = useId()
const DECIMAL_PRECISION = 10
const MIN_INPUT_CHARS = 2

const inputWidth = computed(() => `${Math.max(MIN_INPUT_CHARS, value.value.length) + 0.5}ch`)

function shift(delta: number): void {
  const current = parseOptionalNumber(value.value) ?? props.start - delta
  const next = Math.min(props.max, Math.max(props.min, current + delta))
  value.value = String(Math.round(next * DECIMAL_PRECISION) / DECIMAL_PRECISION)
}
</script>
