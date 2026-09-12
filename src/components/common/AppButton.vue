<template>
  <button
    :class="[
      'app-button',
      `app-button--${variant}`,
      { 'app-button--loading': loading },
    ]"
    :type="type"
    :disabled="isDisabled"
    @click="$emit('click', $event)"
  >
    <span v-if="loading" class="app-button__spinner" aria-hidden="true" />
    <span :class="{ 'app-button__label--hidden': loading }">
      <slot />
    </span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  APP_BUTTON_DEFAULT_TYPE,
  APP_BUTTON_DEFAULT_VARIANT,
  type AppButtonType,
  type AppButtonVariant,
} from '@/constants/ui'
import '@/styles/components/app-button.css'

const props = withDefaults(
  defineProps<{
    variant?: AppButtonVariant
    type?: AppButtonType
    disabled?: boolean
    loading?: boolean
  }>(),
  {
    variant: APP_BUTTON_DEFAULT_VARIANT,
    type: APP_BUTTON_DEFAULT_TYPE,
    disabled: false,
    loading: false,
  },
)

defineEmits<{
  click: [event: MouseEvent]
}>()

const isDisabled = computed(() => props.disabled || props.loading)
</script>
