<template>
  <div
    class="app-language-switch"
    role="group"
    :aria-label="$t('common.language.label')"
  >
    <button
      v-for="code in locales"
      :key="code"
      type="button"
      class="app-language-switch__button"
      :class="{ 'app-language-switch__button--active': currentLocale === code }"
      :aria-pressed="currentLocale === code"
      @click="setLocale(code)"
    >
      {{ $t(localeLabelKey(code)) }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { useLocale } from '@/composables/useLocale'
import type { AppLocale } from '@/types/locale'
import '@/styles/components/app-language-switch.css'

const { currentLocale, locales, setLocale } = useLocale()

/**
 * Returns the i18n key suffix for a locale button label.
 */
function localeLabelKey(code: AppLocale): string {
  return `common.language.${code}`
}
</script>
