import type { AppLocale } from '@/types/locale'

/**
 * Supported application locale codes.
 */
export const APP_LOCALES = ['uk', 'en'] as const

/**
 * Default locale when none is stored.
 */
export const DEFAULT_LOCALE: AppLocale = 'uk'

/**
 * localStorage key for the user's language preference.
 */
export const LOCALE_STORAGE_KEY = 'f-balance-locale'

/**
 * Checks whether a string is a supported locale code.
 */
export function isAppLocale(value: string): value is AppLocale {
  return (APP_LOCALES as readonly string[]).includes(value)
}
