<template>
  <div class="app-select">
    <label class="app-select__label" :for="selectId">{{ label }}</label>
    <select
      :id="selectId"
      class="app-select__field"
      :class="{ 'app-select__field--error': hasError }"
      :value="modelValue"
      :aria-invalid="hasError"
      :aria-describedby="hasError ? `${selectId}-error` : undefined"
      @change="
        emit('update:modelValue', ($event.target as HTMLSelectElement).value)
      "
    >
      <option value="">
        {{ placeholder }}
      </option>
      <option
        v-for="option in options"
        :key="option.value"
        :value="option.value"
      >
        {{ option.label }}
      </option>
    </select>
    <p
      v-if="error"
      :id="`${selectId}-error`"
      class="app-select__error"
      role="alert"
    >
      {{ error }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed, useId } from 'vue'
import '@/styles/components/app-select.css'

export type AppSelectOption = {
  value: string
  label: string
}

const props = defineProps<{
  label: string
  modelValue: string
  options: AppSelectOption[]
  error?: string
  placeholder?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const selectId = useId()
const hasError = computed(() => Boolean(props.error))
</script>
