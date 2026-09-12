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
  ROUTE_NAMES.recommendations,
]

/**
 * Guest-only route names (redirect away when already logged in).
 */
export const GUEST_ONLY_ROUTES: RouteName[] = [
  ROUTE_NAMES.login,
  ROUTE_NAMES.register,
]
