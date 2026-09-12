import {
  DEFAULT_LOCALE,
  isAppLocale,
  LOCALE_STORAGE_KEY,
} from '@/constants/locale'
import type { AppLocale } from '@/types/locale'

/**
 * Reads the persisted locale from localStorage, or the default when missing.
 */
export function readStoredLocale(): AppLocale {
  if (typeof localStorage === 'undefined') {
    return DEFAULT_LOCALE
  }

  const stored = localStorage.getItem(LOCALE_STORAGE_KEY)

  if (stored && isAppLocale(stored)) {
    return stored
  }

  return DEFAULT_LOCALE
}

/**
 * Persists the chosen locale to localStorage.
 */
export function writeStoredLocale(locale: AppLocale): void {
  localStorage.setItem(LOCALE_STORAGE_KEY, locale)
}
