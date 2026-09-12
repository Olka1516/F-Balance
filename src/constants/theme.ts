/**
 * Supported seasonal theme identifiers.
 */
export const SEASONS = ['spring', 'summer', 'autumn', 'winter'] as const

/**
 * Seasonal theme identifier derived from the calendar.
 */
export type Season = (typeof SEASONS)[number]

/**
 * CSS class prefix applied to the document root for seasonal themes.
 */
export const THEME_CLASS_PREFIX = 'theme-'

/**
 * Calendar month (1–12) to season mapping for the Northern Hemisphere.
 */
export const MONTH_TO_SEASON: Record<number, Season> = {
  1: 'winter',
  2: 'winter',
  3: 'spring',
  4: 'spring',
  5: 'spring',
  6: 'summer',
  7: 'summer',
  8: 'summer',
  9: 'autumn',
  10: 'autumn',
  11: 'autumn',
  12: 'winter',
}

/**
 * Builds the document-root CSS class name for a season.
 */
export function getThemeClassName(season: Season): string {
  return `${THEME_CLASS_PREFIX}${season}`
}
