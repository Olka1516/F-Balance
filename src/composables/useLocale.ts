import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { APP_LOCALES } from '@/constants/locale'
import type { AppLocale } from '@/types/locale'
import { writeStoredLocale } from '@/utils/localeStorage'

/**
 * Reactive locale switching with persistence and no page reload.
 */
export function useLocale() {
  const { locale } = useI18n()

  const currentLocale = computed(() => locale.value as AppLocale)

  /**
   * Switches the active locale and saves the preference.
   */
  function setLocale(next: AppLocale): void {
    locale.value = next
    writeStoredLocale(next)
  }

  return {
    currentLocale,
    locales: APP_LOCALES,
    setLocale,
  }
}
