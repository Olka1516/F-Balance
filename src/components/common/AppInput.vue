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
        :aria-invalid="hasError"
        :aria-describedby="hasError ? `${inputId}-error` : undefined"
        @input="
          emit('update:modelValue', ($event.target as HTMLInputElement).value)
        "
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
const iconMarkup = computed(() => {
  if (props.icon === APP_INPUT_ICON.email) {
    return iconEmail
  }

  if (props.icon === APP_INPUT_ICON.password) {
    return iconPassword
  }

  return ''
})
</script>
