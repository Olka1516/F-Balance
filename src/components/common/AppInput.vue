<template>
  <div
    class="app-input"
    :class="[
      `app-input--${variant ?? APP_INPUT_DEFAULT_VARIANT}`,
      { 'app-input--with-icon': hasIcon },
    ]"
  >
    <label class="app-input__label" :for="inputId">{{ label }}</label>
    <div class="app-input__control">
      <input
        :id="inputId"
        class="app-input__field"
        :class="{
          'app-input__field--error': hasError,
          'app-input__field--readonly': readonly,
        }"
        :type="type ?? APP_INPUT_DEFAULT_TYPE"
        :value="modelValue"
        :autocomplete="autocomplete"
        :placeholder="placeholder"
        :readonly="readonly"
        :min="resolvedMin"
        :inputmode="isNumberType ? 'decimal' : undefined"
        :aria-invalid="hasError"
        :aria-describedby="hasError ? `${inputId}-error` : undefined"
        @input="onInput"
      />
      <span
        v-if="hasIcon && iconMarkup"
        class="app-input__icon"
        aria-hidden="true"
        v-html="iconMarkup"
      />
    </div>
    <p
      v-if="error"
      :id="`${inputId}-error`"
      class="app-input__error"
      role="alert"
    >
      {{ error }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed, useId } from 'vue'
import iconEmail from '@/assets/icons/email.svg?raw'
import iconPassword from '@/assets/icons/password.svg?raw'
import {
  APP_INPUT_DEFAULT_ICON,
  APP_INPUT_DEFAULT_TYPE,
  APP_INPUT_DEFAULT_VARIANT,
  APP_INPUT_ICON,
  APP_INPUT_TYPE,
  type AppInputIcon,
  type AppInputType,
  type AppInputVariant,
} from '@/constants/ui'
import '@/styles/components/app-input.css'

const props = withDefaults(
  defineProps<{
    label: string
    modelValue: string
    error?: string
    type?: AppInputType
    autocomplete?: string
    placeholder?: string
    variant?: AppInputVariant
    icon?: AppInputIcon
    readonly?: boolean
    min?: number | string
  }>(),
  {
    variant: APP_INPUT_DEFAULT_VARIANT,
    icon: APP_INPUT_DEFAULT_ICON,
    readonly: false,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const inputId = useId()
const hasError = computed(() => Boolean(props.error))
const hasIcon = computed(() => props.icon !== APP_INPUT_ICON.none)
const isNumberType = computed(
  () => (props.type ?? APP_INPUT_DEFAULT_TYPE) === APP_INPUT_TYPE.number,
)
const resolvedMin = computed(() => {
  if (props.min != null) {
    return props.min
  }

  return isNumberType.value ? 0 : undefined
})
const iconMarkup = computed(() => {
  if (props.icon === APP_INPUT_ICON.email) {
    return iconEmail
  }

  if (props.icon === APP_INPUT_ICON.password) {
    return iconPassword
  }

  return ''
})

function onInput(event: Event): void {
  const target = event.target as HTMLInputElement
  let value = target.value

  if (isNumberType.value) {
    value = value.replace(/[^\d.,]/g, '').replace(/,/g, '.')

    if (value.startsWith('.')) {
      value = `0${value}`
    }

    const minValue = Number(resolvedMin.value ?? 0)

    if (Number.isFinite(minValue) && value !== '' && Number(value) < minValue) {
      value = String(minValue)
    }

    if (target.value !== value) {
      target.value = value
    }
  }

  emit('update:modelValue', value)
}
</script>
