/**
 * Named Vue Router route identifiers.
 */
export const ROUTE_NAMES = {
  landing: 'landing',
  login: 'login',
  register: 'register',
  resetPassword: 'reset-password',
  onboarding: 'onboarding',
  dashboard: 'dashboard',
  addMeal: 'add-meal',
  myMeals: 'my-meals',
  profile: 'profile',
  progress: 'progress',
  recommendations: 'recommendations',
} as const

/**
 * Application route name.
 */
export type RouteName = (typeof ROUTE_NAMES)[keyof typeof ROUTE_NAMES]

/**
 * Route names that require an authenticated session.
 */
export const AUTH_REQUIRED_ROUTES: RouteName[] = [
  ROUTE_NAMES.onboarding,
  ROUTE_NAMES.dashboard,
  ROUTE_NAMES.addMeal,
  ROUTE_NAMES.myMeals,
  ROUTE_NAMES.profile,
  ROUTE_NAMES.progress,
  ROUTE_NAMES.recommendations,
]

/**
 * Guest-only route names (redirect away when already logged in).
 */
export const GUEST_ONLY_ROUTES: RouteName[] = [
  ROUTE_NAMES.login,
  ROUTE_NAMES.register,
]

/**
 * Icon identifiers used by the main navigation.
 */
export type AppNavIcon = 'today' | 'meals' | 'plus' | 'progress' | 'profile'

/**
 * Main navigation items: bottom tab bar on mobile, sidebar on desktop.
 */
export const APP_NAV_ITEMS: ReadonlyArray<{
  name: RouteName
  labelKey: string
  icon: AppNavIcon
  primary?: boolean
}> = [
  { name: ROUTE_NAMES.dashboard, labelKey: 'common.nav.today', icon: 'today' },
  { name: ROUTE_NAMES.myMeals, labelKey: 'common.nav.meals', icon: 'meals' },
  { name: ROUTE_NAMES.addMeal, labelKey: 'common.nav.addMeal', icon: 'plus', primary: true },
  { name: ROUTE_NAMES.progress, labelKey: 'common.nav.progress', icon: 'progress' },
  { name: ROUTE_NAMES.profile, labelKey: 'common.nav.profile', icon: 'profile' },
]
