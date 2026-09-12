<template>
  <div class="app-input">
    <label class="app-input__label" :for="inputId">{{ label }}</label>
    <input
      :id="inputId"
      class="app-input__field"
      :class="{ 'app-input__field--error': hasError }"
      :type="type ?? APP_INPUT_DEFAULT_TYPE"
      :value="modelValue"
      :autocomplete="autocomplete"
      :placeholder="placeholder"
      :aria-invalid="hasError"
      :aria-describedby="hasError ? `${inputId}-error` : undefined"
      @input="
        emit('update:modelValue', ($event.target as HTMLInputElement).value)
      "
    />
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
import {
  APP_INPUT_DEFAULT_TYPE,
  type AppInputType,
} from '@/constants/ui'
import '@/styles/components/app-input.css'

const props = defineProps<{
  label: string
  modelValue: string
  error?: string
  type?: AppInputType
  autocomplete?: string
  placeholder?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const inputId = useId()
const hasError = computed(() => Boolean(props.error))
</script>
