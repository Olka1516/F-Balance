<template>
  <div
    class="app-loader"
    :class="`app-loader--${variant}`"
    role="status"
    :aria-label="label ?? t('common.loading')"
  >
    <span
      v-if="variant === APP_LOADER_VARIANT_SPINNER"
      class="app-loader__spinner"
      aria-hidden="true"
    />
    <div v-else class="app-loader__skeleton" aria-hidden="true">
      <span
        class="app-loader__skeleton-line app-loader__skeleton-line--title"
      />
      <span class="app-loader__skeleton-line" />
      <span
        class="app-loader__skeleton-line app-loader__skeleton-line--short"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import {
  APP_LOADER_DEFAULT_VARIANT,
  APP_LOADER_VARIANT_SPINNER,
  type AppLoaderVariant,
} from '@/constants/ui'
import '@/styles/components/app-loader.css'

withDefaults(
  defineProps<{
    variant?: AppLoaderVariant
    label?: string
  }>(),
  {
    variant: APP_LOADER_DEFAULT_VARIANT,
    label: undefined,
  },
)

const { t } = useI18n()
</script>
