/**
 * SVG calorie ring viewBox size.
 */
export const DASHBOARD_RING_VIEWBOX_SIZE = 120

/**
 * SVG calorie ring radius.
 */
export const DASHBOARD_RING_RADIUS = 48

/**
 * SVG calorie ring stroke width.
 */
export const DASHBOARD_RING_STROKE_WIDTH = 10

/**
 * SVG calorie ring circumference for the progress stroke.
 */
export const DASHBOARD_RING_CIRCUMFERENCE =
  2 * Math.PI * DASHBOARD_RING_RADIUS

/**
 * Chart canvas height for the weekly progress chart.
 */
export const DASHBOARD_WEEK_CHART_HEIGHT_REM = 14

/**
 * Number of calendar days shown on the weekly progress chart.
 */
export const DASHBOARD_WEEK_DAYS = 7

/**
 * Animation duration for the dashboard progress chart in milliseconds.
 */
export const DASHBOARD_CHART_ANIMATION_MS = 450

/**
 * Atwater kcal per gram of protein.
 */
export const MACRO_KCAL_PROTEIN = 4

/**
 * Atwater kcal per gram of carbs.
 */
export const MACRO_KCAL_CARBS = 4

/**
 * Atwater kcal per gram of fat.
 */
export const MACRO_KCAL_FAT = 9

/**
 * A day counts as "within target" when calories are inside ±this share of the target.
 */
export const PROGRESS_TARGET_TOLERANCE = 0.1
