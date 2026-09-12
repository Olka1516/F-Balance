import type { AuthError, Session, User } from '@supabase/supabase-js'
import {
  SUPABASE_ERROR_CODES,
  type SupabaseErrorCode,
} from '@/services/supabase/errors'

type StubAuthResult = {
  data: { session: Session | null; user: User | null }
  error: AuthError
}

/**
 * Creates a stub AuthError for degraded Supabase mode.
 */
export function createStubAuthError(code: SupabaseErrorCode): AuthError {
  return {
    name: 'AuthError',
    message: code,
    status: 503,
    code,
  } as AuthError
}

/**
 * Returns a failed auth-shaped response used when Supabase is unavailable.
 */
export function createStubAuthFailure(code: SupabaseErrorCode = SUPABASE_ERROR_CODES.unavailable): StubAuthResult {
  return {
    data: { session: null, user: null },
    error: createStubAuthError(code),
  }
}

type StubQueryResult = {
  data: null
  error: { message: string; code: string }
}

/**
 * Minimal stub surface used when the real Supabase client cannot start.
 */
export function createSupabaseStub(code: SupabaseErrorCode = SUPABASE_ERROR_CODES.unavailable) {
  const failure = () => Promise.resolve(createStubAuthFailure(code))
  const queryFailure = (): Promise<StubQueryResult> =>
    Promise.resolve({
      data: null,
      error: { message: code, code: 'PGRST000' },
    })

  const createQueryBuilder = () => {
    const builder = {
      select: () => builder,
      insert: () => builder,
      update: () => builder,
      upsert: () => builder,
      eq: () => builder,
      maybeSingle: queryFailure,
      single: queryFailure,
    }

    return builder
  }

  return {
    auth: {
      signUp: failure,
      signInWithPassword: failure,
      signOut: failure,
      resetPasswordForEmail: failure,
      updateUser: failure,
      getSession: async () => ({
        data: { session: null },
        error: createStubAuthError(code),
      }),
      onAuthStateChange: () => ({
        data: {
          subscription: {
            unsubscribe: () => undefined,
          },
        },
      }),
    },
    from: () => createQueryBuilder(),
  }
}

/**
 * Stub client type used while Supabase is unavailable.
 */
export type SupabaseStubClient = ReturnType<typeof createSupabaseStub>
