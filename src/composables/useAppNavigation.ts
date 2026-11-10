import { useRouter } from 'vue-router'
import type { MealType } from '@/constants/meals'
import { ROUTE_NAMES } from '@/constants/routes'

/**
 * Navigates to main auth-related app routes.
 */
export function useAppNavigation() {
  const router = useRouter()

  /**
   * Opens the registration screen.
   */
  function goToRegister(): void {
    router.push({ name: ROUTE_NAMES.register })
  }

  /**
   * Opens the login screen.
   */
  function goToLogin(): void {
    router.push({ name: ROUTE_NAMES.login })
  }

  /**
   * Opens the password-reset screen.
   */
  function goToResetPassword(): void {
    router.push({ name: ROUTE_NAMES.resetPassword })
  }

  /**
   * Opens the landing page.
   */
  function goToLanding(): void {
    router.push({ name: ROUTE_NAMES.landing })
  }

  /**
   * Opens the dashboard.
   */
  function goToDashboard(): void {
    router.push({ name: ROUTE_NAMES.dashboard })
  }

  /**
   * Opens the add-food screen, optionally editing a meal or targeting a meal slot.
   */
  function goToAddMeal(mealId?: string, mealType?: MealType): void {
    router.push({
      name: ROUTE_NAMES.addMeal,
      query: {
        ...(mealId ? { mealId } : {}),
        ...(mealType ? { mealType } : {}),
      },
    })
  }

  /**
   * Opens the saved meals list.
   */
  function goToMyMeals(): void {
    router.push({ name: ROUTE_NAMES.myMeals })
  }

  /**
   * Opens the profile screen.
   */
  function goToProfile(): void {
    router.push({ name: ROUTE_NAMES.profile })
  }

  return {
    goToRegister,
    goToLogin,
    goToResetPassword,
    goToLanding,
    goToDashboard,
    goToAddMeal,
    goToMyMeals,
    goToProfile,
  }
}
