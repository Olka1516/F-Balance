import type { AuthError, Session, User } from '@supabase/supabase-js'
import { AUTH_RESET_REDIRECT_PATH } from '@/constants/auth'
import { getSupabase } from '@/services/supabase'
import { SUPABASE_ERROR_CODES } from '@/services/supabase/errors'

export type AuthActionResult =
  | { ok: true; session: Session | null; user: User | null }
  | { ok: false; code: string }

/**
 * Maps a Supabase auth error to a stable i18n error code.
 */
export function mapAuthErrorCode(error: AuthError | null): string {
  if (!error) {
    return 'unknown'
  }

  const code = 'code' in error ? String(error.code ?? '') : ''
  const message = error.message.toLowerCase()

  if (
    code === SUPABASE_ERROR_CODES.configMissing ||
    message.includes(SUPABASE_ERROR_CODES.configMissing)
  ) {
    return SUPABASE_ERROR_CODES.configMissing
  }

  if (
    code === SUPABASE_ERROR_CODES.unavailable ||
    message.includes(SUPABASE_ERROR_CODES.unavailable)
  ) {
    return SUPABASE_ERROR_CODES.unavailable
  }

  if (
    code === SUPABASE_ERROR_CODES.connectionFailed ||
    message.includes('failed to fetch') ||
    message.includes('network')
  ) {
    return SUPABASE_ERROR_CODES.connectionFailed
  }

  if (
    code === SUPABASE_ERROR_CODES.timeout ||
    message.includes('timeout')
  ) {
    return SUPABASE_ERROR_CODES.timeout
  }

  if (message.includes('invalid login credentials')) {
    return 'invalidCredentials'
  }

  if (message.includes('user already registered')) {
    return 'emailTaken'
  }

  if (message.includes('email not confirmed')) {
    return 'emailNotConfirmed'
  }

  if (message.includes('password')) {
    return 'weakPassword'
  }

  if (message.includes('rate limit') || message.includes('too many')) {
    return 'rateLimited'
  }

  return 'unknown'
}

/**
 * Signs up with email and password.
 */
export async function signUpWithEmail(
  email: string,
  password: string,
): Promise<AuthActionResult> {
  const { data, error } = await getSupabase().auth.signUp({ email, password })

  if (error) {
    return { ok: false, code: mapAuthErrorCode(error) }
  }

  return { ok: true, session: data.session, user: data.user }
}

/**
 * Signs in with email and password.
 */
export async function signInWithEmail(
  email: string,
  password: string,
): Promise<AuthActionResult> {
  const { data, error } = await getSupabase().auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { ok: false, code: mapAuthErrorCode(error) }
  }

  return { ok: true, session: data.session, user: data.user }
}

/**
 * Signs out the current user.
 */
export async function signOut(): Promise<AuthActionResult> {
  const { error } = await getSupabase().auth.signOut()

  if (error) {
    return { ok: false, code: mapAuthErrorCode(error) }
  }

  return { ok: true, session: null, user: null }
}

/**
 * Sends a password-reset email.
 */
export async function requestPasswordReset(
  email: string,
): Promise<AuthActionResult> {
  const redirectTo = `${window.location.origin}${AUTH_RESET_REDIRECT_PATH}`
  const { error } = await getSupabase().auth.resetPasswordForEmail(email, {
    redirectTo,
  })

  if (error) {
    return { ok: false, code: mapAuthErrorCode(error) }
  }

  return { ok: true, session: null, user: null }
}

/**
 * Updates the password for the authenticated recovery session.
 */
export async function updatePassword(
  password: string,
): Promise<AuthActionResult> {
  const { data, error } = await getSupabase().auth.updateUser({ password })

  if (error) {
    return { ok: false, code: mapAuthErrorCode(error) }
  }

  return { ok: true, session: null, user: data.user }
}

/**
 * Reads the current Supabase session.
 */
export async function getCurrentSession(): Promise<Session | null> {
  const { data } = await getSupabase().auth.getSession()
  return data.session
}
