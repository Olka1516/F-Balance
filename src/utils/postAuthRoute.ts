import { ROUTE_NAMES, type RouteName } from '@/constants/routes'
import { fetchUserProfile } from '@/services/profile'

/**
 * Picks dashboard or onboarding after auth based on profile completion.
 */
export async function resolvePostAuthRoute(userId: string): Promise<RouteName> {
  const result = await fetchUserProfile(userId)

  if (!result.ok || !result.profile?.onboardingCompleted) {
    return ROUTE_NAMES.onboarding
  }

  return ROUTE_NAMES.dashboard
}

/**
 * Whether an authenticated user may open the route before onboarding is done.
 */
export function isOnboardingExemptRoute(routeName: RouteName | undefined): boolean {
  return (
    routeName === ROUTE_NAMES.onboarding ||
    routeName === ROUTE_NAMES.profile ||
    routeName === ROUTE_NAMES.resetPassword
  )
}
