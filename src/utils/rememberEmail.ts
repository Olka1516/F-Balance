import { AUTH_REMEMBER_EMAIL_KEY } from '@/constants/auth'

/**
 * Reads the remembered login email from localStorage.
 */
export function getRememberedEmail(): string {
  try {
    return localStorage.getItem(AUTH_REMEMBER_EMAIL_KEY) ?? ''
  } catch {
    return ''
  }
}

/**
 * Saves or clears the remembered login email.
 * @param email Email to store when remember is enabled
 * @param remember Whether the email should be persisted
 */
export function setRememberedEmail(email: string, remember: boolean): void {
  try {
    if (remember && email) {
      localStorage.setItem(AUTH_REMEMBER_EMAIL_KEY, email)
      return
    }

    localStorage.removeItem(AUTH_REMEMBER_EMAIL_KEY)
  } catch {
    return
  }
}
