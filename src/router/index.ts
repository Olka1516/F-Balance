import { createRouter, createWebHistory } from 'vue-router'
import {
  AUTH_REQUIRED_ROUTES,
  GUEST_ONLY_ROUTES,
  ROUTE_NAMES,
  type RouteName,
} from '@/constants/routes'
import { useAuth } from '@/composables/useAuth'
import {
  isOnboardingExemptRoute,
  resolvePostAuthRoute,
} from '@/utils/postAuthRoute'
import LandingView from '@/views/LandingView.vue'

/**
 * Application router with lazy-loaded views and auth-aware navigation guards.
 */
export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: ROUTE_NAMES.landing,
      component: LandingView,
    },
    {
      path: '/login',
      name: ROUTE_NAMES.login,
      component: () => import('@/views/LoginView.vue'),
      meta: { guestOnly: true },
    },
    {
      path: '/register',
      name: ROUTE_NAMES.register,
      component: () => import('@/views/RegisterView.vue'),
      meta: { guestOnly: true },
    },
    {
      path: '/reset-password',
      name: ROUTE_NAMES.resetPassword,
      component: () => import('@/views/ResetPasswordView.vue'),
    },
    {
      path: '/onboarding',
      name: ROUTE_NAMES.onboarding,
      component: () => import('@/views/OnboardingView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/dashboard',
      name: ROUTE_NAMES.dashboard,
      component: () => import('@/views/DashboardView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/meals/add',
      name: ROUTE_NAMES.addMeal,
      component: () => import('@/views/AddMealView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/meals',
      name: ROUTE_NAMES.myMeals,
      component: () => import('@/views/MyMealsView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/profile',
      name: ROUTE_NAMES.profile,
      component: () => import('@/views/ProfileView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/recommendations',
      name: ROUTE_NAMES.recommendations,
      component: () => import('@/views/RecommendationsView.vue'),
      meta: { requiresAuth: true },
    },
  ],
})

router.beforeEach(async (to) => {
  const { initAuth, isAuthenticated, isInitialized, user } = useAuth()

  if (!isInitialized.value) {
    await initAuth()
  }

  const routeName = to.name as RouteName | undefined
  const requiresAuth =
    to.meta.requiresAuth === true ||
    (routeName ? AUTH_REQUIRED_ROUTES.includes(routeName) : false)
  const guestOnly =
    to.meta.guestOnly === true ||
    (routeName ? GUEST_ONLY_ROUTES.includes(routeName) : false)

  if (requiresAuth && !isAuthenticated.value) {
    return { name: ROUTE_NAMES.login }
  }

  if (guestOnly && isAuthenticated.value && user.value?.id) {
    return { name: await resolvePostAuthRoute(user.value.id) }
  }

  if (
    isAuthenticated.value &&
    user.value?.id &&
    requiresAuth &&
    !isOnboardingExemptRoute(routeName)
  ) {
    const destination = await resolvePostAuthRoute(user.value.id)

    if (destination === ROUTE_NAMES.onboarding) {
      return { name: ROUTE_NAMES.onboarding }
    }
  }

  if (
    isAuthenticated.value &&
    user.value?.id &&
    routeName === ROUTE_NAMES.onboarding
  ) {
    const destination = await resolvePostAuthRoute(user.value.id)

    if (destination === ROUTE_NAMES.dashboard) {
      return { name: ROUTE_NAMES.dashboard }
    }
  }

  return true
})
