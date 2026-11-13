/**
 * SVG calorie ring viewBox size.
 */
export const DASHBOARD_RING_VIEWBOX_SIZE = 220

/**
 * SVG calorie ring radius.
 */
export const DASHBOARD_RING_RADIUS = 100

/**
 * SVG calorie ring stroke width.
 */
export const DASHBOARD_RING_STROKE_WIDTH = 10

/**
 * Number of decorative sparkles floating over the dashboard hero.
 */
export const DASHBOARD_HERO_SPARKLE_COUNT = 5

/**
 * SVG calorie ring circumference for the progress stroke.
 */
export const DASHBOARD_RING_CIRCUMFERENCE =
  2 * Math.PI * DASHBOARD_RING_RADIUS

/**
 * Periods the Progress screen can summarise.
 */
export const PROGRESS_PERIODS = ['week', 'month'] as const

/**
 * Progress screen period.
 */
export type ProgressPeriod = (typeof PROGRESS_PERIODS)[number]

/**
 * Chart canvas height for the Progress calories chart.
 */
export const PROGRESS_CHART_HEIGHT_REM = 11

/**
 * Animation duration for the Progress calories chart in milliseconds.
 */
export const PROGRESS_CHART_ANIMATION_MS = 450

/**
 * Days in a week, used to step the Progress period back and forth.
 */
export const DAYS_PER_WEEK = 7

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
