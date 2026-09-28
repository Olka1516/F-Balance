/**
 * Chart canvas height for the dashboard progress bar chart.
 */
export const DASHBOARD_CHART_HEIGHT_REM = 12

/**
 * ECharts bar width relative to the category band.
 */
export const DASHBOARD_CHART_BAR_WIDTH = '42%'

/**
 * Animation duration for the dashboard progress chart in milliseconds.
 */
export const DASHBOARD_CHART_ANIMATION_MS = 450

/**
 * Dashboard chart tab identifiers.
 */
export const DASHBOARD_CHART_TABS = ['calories', 'macros'] as const

/**
 * Dashboard chart tab.
 */
export type DashboardChartTab = (typeof DASHBOARD_CHART_TABS)[number]

/**
 * Default dashboard chart tab.
 */
export const DASHBOARD_CHART_TAB_DEFAULT: DashboardChartTab = 'calories'

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
