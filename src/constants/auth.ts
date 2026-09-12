/**
 * Minimum password length for auth forms.
 */
export const AUTH_PASSWORD_MIN_LENGTH = 8

/**
 * Auth form field names used across login, register, and reset.
 */
export const AUTH_FIELDS = {
  email: 'email',
  password: 'password',
  confirmPassword: 'confirmPassword',
} as const

/**
 * HTML autocomplete tokens for auth inputs.
 */
export const AUTH_AUTOCOMPLETE = {
  email: 'email',
  currentPassword: 'current-password',
  newPassword: 'new-password',
} as const

/**
 * Redirect path used in password-reset emails.
 */
export const AUTH_RESET_REDIRECT_PATH = '/reset-password'

/**
 * localStorage key for remembered login email.
 */
export const AUTH_REMEMBER_EMAIL_KEY = 'f-balance-remember-email'
