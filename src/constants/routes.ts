/**
 * Named Vue Router route identifiers.
 */
export const ROUTE_NAMES = {
  landing: 'landing',
  login: 'login',
  register: 'register',
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
