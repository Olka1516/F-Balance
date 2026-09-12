import { computed, readonly, ref } from 'vue'
import type { Session, User } from '@supabase/supabase-js'
import {
  getCurrentSession,
  requestPasswordReset,
  signInWithEmail,
  signOut,
  signUpWithEmail,
  updatePassword,
  type AuthActionResult,
} from '@/services/auth'
import {
  connectSupabase,
  getSupabase,
  getSupabaseReadiness,
  isSupabaseConnected,
} from '@/services/supabase'

const session = ref<Session | null>(null)
const user = ref<User | null>(null)
const isInitialized = ref(false)
const isAuthLoading = ref(false)

let unsubscribeAuth: (() => void) | null = null

/**
 * Shared auth session state and auth actions for the app.
 */
export function useAuth() {
  const isAuthenticated = computed(() => Boolean(session.value))

  /**
   * Initializes Supabase from the frontend, then loads the auth session.
   */
  async function initAuth(): Promise<void> {
    if (isInitialized.value) {
      return
    }

    isAuthLoading.value = true

    try {
      await connectSupabase()

      if (!isSupabaseConnected()) {
        isInitialized.value = true
        return
      }

      const currentSession = await getCurrentSession()
      session.value = currentSession
      user.value = currentSession?.user ?? null

      const { data } = getSupabase().auth.onAuthStateChange((_event, nextSession) => {
        session.value = nextSession
        user.value = nextSession?.user ?? null
      })

      unsubscribeAuth = () => data.subscription.unsubscribe()
    } finally {
      isAuthLoading.value = false
      isInitialized.value = true
    }
  }

  /**
   * Registers a new account with email and password.
   */
  async function register(
    email: string,
    password: string,
  ): Promise<AuthActionResult> {
    const readiness = getSupabaseReadiness()

    if (!readiness.ready) {
      return { ok: false, code: readiness.code }
    }

    isAuthLoading.value = true

    try {
      const result = await signUpWithEmail(email, password)

      if (result.ok) {
        session.value = result.session
        user.value = result.user
      }

      return result
    } finally {
      isAuthLoading.value = false
    }
  }

  /**
   * Logs in with email and password.
   */
  async function login(
    email: string,
    password: string,
  ): Promise<AuthActionResult> {
    const readiness = getSupabaseReadiness()

    if (!readiness.ready) {
      return { ok: false, code: readiness.code }
    }

    isAuthLoading.value = true

    try {
      const result = await signInWithEmail(email, password)

      if (result.ok) {
        session.value = result.session
        user.value = result.user
      }

      return result
    } finally {
      isAuthLoading.value = false
    }
  }

  /**
   * Logs out and clears the local session.
   */
  async function logout(): Promise<AuthActionResult> {
    isAuthLoading.value = true

    try {
      const result = await signOut()

      if (result.ok) {
        session.value = null
        user.value = null
      }

      return result
    } finally {
      isAuthLoading.value = false
    }
  }

  /**
   * Requests a password-reset email.
   */
  async function resetPassword(email: string): Promise<AuthActionResult> {
    const readiness = getSupabaseReadiness()

    if (!readiness.ready) {
      return { ok: false, code: readiness.code }
    }

    isAuthLoading.value = true

    try {
      return await requestPasswordReset(email)
    } finally {
      isAuthLoading.value = false
    }
  }

  /**
   * Sets a new password after a recovery link.
   */
  async function setNewPassword(password: string): Promise<AuthActionResult> {
    const readiness = getSupabaseReadiness()

    if (!readiness.ready) {
      return { ok: false, code: readiness.code }
    }

    isAuthLoading.value = true

    try {
      return await updatePassword(password)
    } finally {
      isAuthLoading.value = false
    }
  }

  return {
    session: readonly(session),
    user: readonly(user),
    isAuthenticated,
    isInitialized: readonly(isInitialized),
    isAuthLoading: readonly(isAuthLoading),
    initAuth,
    register,
    login,
    logout,
    resetPassword,
    setNewPassword,
  }
}

/**
 * Tears down the auth listener (tests / hot reload).
 */
export function disposeAuthListener(): void {
  unsubscribeAuth?.()
  unsubscribeAuth = null
}
