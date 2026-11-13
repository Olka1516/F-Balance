<template>
  <div class="app-segmented" role="radiogroup" :aria-label="label">
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      role="radio"
      class="app-segmented__option"
      :class="{ 'app-segmented__option--active': modelValue === option.value }"
      :aria-checked="modelValue === option.value"
      @click="emit('update:modelValue', option.value)"
    >
      {{ option.label }}
    </button>
  </div>
</template>

<script setup lang="ts">
import '@/styles/components/app-segmented.css'

/**
 * Pill-shaped single choice control (a radio group drawn as segments).
 */
defineProps<{
  modelValue: string
  options: ReadonlyArray<{ value: string; label: string }>
  label: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>
