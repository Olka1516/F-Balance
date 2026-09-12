import { useRouter } from 'vue-router'
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

  return {
    goToRegister,
    goToLogin,
  }
}
