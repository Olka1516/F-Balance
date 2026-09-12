import { createRouter, createWebHistory } from 'vue-router'
import { ROUTE_NAMES } from '@/constants/routes'
import LandingView from '@/views/LandingView.vue'

/**
 * Application router with lazy-loaded views for authenticated and app screens.
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
    },
    {
      path: '/register',
      name: ROUTE_NAMES.register,
      component: () => import('@/views/RegisterView.vue'),
    },
    {
      path: '/onboarding',
      name: ROUTE_NAMES.onboarding,
      component: () => import('@/views/OnboardingView.vue'),
    },
    {
      path: '/dashboard',
      name: ROUTE_NAMES.dashboard,
      component: () => import('@/views/DashboardView.vue'),
    },
    {
      path: '/meals/add',
      name: ROUTE_NAMES.addMeal,
      component: () => import('@/views/AddMealView.vue'),
    },
    {
      path: '/meals',
      name: ROUTE_NAMES.myMeals,
      component: () => import('@/views/MyMealsView.vue'),
    },
    {
      path: '/profile',
      name: ROUTE_NAMES.profile,
      component: () => import('@/views/ProfileView.vue'),
    },
    {
      path: '/recommendations',
      name: ROUTE_NAMES.recommendations,
      component: () => import('@/views/RecommendationsView.vue'),
    },
  ],
})
