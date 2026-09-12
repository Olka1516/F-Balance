/**
 * Decorative dashboard preview values on the landing page.
 */
export const LANDING_PREVIEW = {
  calories: 1840,
  protein: 62,
  fat: 48,
  carbs: 210,
  progressPercent: 68,
} as const

/**
 * SVG calorie ring geometry on the landing hero.
 */
export const LANDING_RING_VIEWBOX_SIZE = 120

/**
 * Calorie ring circle radius in SVG units.
 */
export const LANDING_RING_RADIUS = 52

/**
 * Calorie ring stroke width in SVG units.
 */
export const LANDING_RING_STROKE_WIDTH = 8

/**
 * Calorie ring circumference derived from the ring radius.
 */
export const LANDING_RING_CIRCUMFERENCE = 2 * Math.PI * LANDING_RING_RADIUS

/**
 * Calorie ring center coordinate in the SVG viewBox.
 */
export const LANDING_RING_CENTER = LANDING_RING_VIEWBOX_SIZE / 2
