import type { SupabaseClient } from '@supabase/supabase-js'
import {
  SUPABASE_HEALTH_TIMEOUT_MS,
  SUPABASE_RECONNECT_BASE_MS,
  SUPABASE_RECONNECT_MAX_ATTEMPTS,
  SUPABASE_RECONNECT_MAX_MS,
  type SupabaseConnectionStatus,
} from '@/constants/supabase'
import { createSupabaseClient, hasSupabaseConfig } from '@/services/supabase/client'
import {
  mapSupabaseErrorCode,
  SUPABASE_ERROR_CODES,
  type SupabaseErrorCode,
} from '@/services/supabase/errors'
import {
  createSupabaseStub,
  type SupabaseStubClient,
} from '@/services/supabase/stub'

type ActiveClient = SupabaseClient | SupabaseStubClient

let activeClient: ActiveClient | null = null
let connectionStatus: SupabaseConnectionStatus = 'idle'
let lastErrorCode: SupabaseErrorCode | null = null
let reconnectAttempt = 0
let reconnectTimer: ReturnType<typeof setTimeout> | null = null
let connectPromise: Promise<boolean> | null = null

/**
 * Returns the current Supabase connection status.
 */
export function getSupabaseConnectionStatus(): SupabaseConnectionStatus {
  return connectionStatus
}

/**
 * Returns the last connection error code, if any.
 */
export function getSupabaseLastErrorCode(): SupabaseErrorCode | null {
  return lastErrorCode
}

/**
 * Whether the live Supabase client is connected and usable.
 */
export function isSupabaseConnected(): boolean {
  return connectionStatus === 'connected' && activeClient !== null && !isStubClient(activeClient)
}

/**
 * Returns whether Supabase is ready for frontend API calls.
 */
export function getSupabaseReadiness():
  | { ready: true }
  | { ready: false; code: SupabaseErrorCode } {
  if (isSupabaseConnected()) {
    return { ready: true }
  }

  return {
    ready: false,
    code: lastErrorCode ?? SUPABASE_ERROR_CODES.unavailable,
  }
}

/**
 * Returns the active client (live or stub). Prefer `isSupabaseConnected` before writes.
 */
export function getSupabase(): ActiveClient {
  if (!activeClient) {
    activeClient = createSupabaseStub(SUPABASE_ERROR_CODES.unavailable)
    connectionStatus = 'unavailable'
    lastErrorCode = SUPABASE_ERROR_CODES.unavailable
  }

  return activeClient
}

/**
 * Connects the frontend Supabase client and runs a health check.
 */
export async function connectSupabase(): Promise<boolean> {
  if (
    connectionStatus === 'connected' &&
    activeClient &&
    !isStubClient(activeClient)
  ) {
    return true
  }

  if (connectPromise) {
    return connectPromise
  }

  connectPromise = performConnect()

  try {
    return await connectPromise
  } finally {
    connectPromise = null
  }
}

/**
 * Disconnects the Supabase client and cancels pending reconnects.
 */
export async function disconnectSupabase(): Promise<void> {
  clearReconnectTimer()
  reconnectAttempt = 0

  if (activeClient && !isStubClient(activeClient)) {
    await activeClient.auth.signOut({ scope: 'local' }).catch(() => undefined)
  }

  activeClient = createSupabaseStub(SUPABASE_ERROR_CODES.disconnected)
  connectionStatus = 'disconnected'
  lastErrorCode = SUPABASE_ERROR_CODES.disconnected
}

/**
 * Forces a reconnect attempt from the frontend.
 */
export async function reconnectSupabase(): Promise<boolean> {
  clearReconnectTimer()
  reconnectAttempt = 0
  connectionStatus = 'connecting'
  return connectSupabase()
}

/**
 * Schedules an automatic reconnect with exponential backoff.
 */
export function scheduleSupabaseReconnect(): void {
  if (reconnectTimer || reconnectAttempt >= SUPABASE_RECONNECT_MAX_ATTEMPTS) {
    if (reconnectAttempt >= SUPABASE_RECONNECT_MAX_ATTEMPTS) {
      activateStub(SUPABASE_ERROR_CODES.unavailable)
    }
    return
  }

  const delay = Math.min(
    SUPABASE_RECONNECT_BASE_MS * 2 ** reconnectAttempt,
    SUPABASE_RECONNECT_MAX_MS,
  )

  reconnectAttempt += 1
  connectionStatus = 'degraded'

  reconnectTimer = setTimeout(() => {
    reconnectTimer = null
    void connectSupabase()
  }, delay)
}

async function performConnect(): Promise<boolean> {
  clearReconnectTimer()
  connectionStatus = 'connecting'

  if (!hasSupabaseConfig()) {
    activateStub(SUPABASE_ERROR_CODES.configMissing)
    return false
  }

  try {
    const client = createSupabaseClient()
    await assertClientHealthy(client)
    activeClient = client
    connectionStatus = 'connected'
    lastErrorCode = null
    reconnectAttempt = 0
    return true
  } catch (error) {
    lastErrorCode = mapSupabaseErrorCode(error)
    activateStub(lastErrorCode)
    scheduleSupabaseReconnect()
    return false
  }
}

async function assertClientHealthy(client: SupabaseClient): Promise<void> {
  const healthCheck = client.auth.getSession()
  const timeout = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error('Supabase health check timed out'))
    }, SUPABASE_HEALTH_TIMEOUT_MS)
  })

  const { error } = await Promise.race([healthCheck, timeout])

  if (error) {
    throw error
  }
}

function activateStub(code: SupabaseErrorCode): void {
  activeClient = createSupabaseStub(code)
  lastErrorCode = code
  connectionStatus =
    code === SUPABASE_ERROR_CODES.configMissing ? 'unavailable' : 'degraded'

  if (code === SUPABASE_ERROR_CODES.unavailable) {
    connectionStatus = 'unavailable'
  }
}

function clearReconnectTimer(): void {
  if (!reconnectTimer) {
    return
  }

  clearTimeout(reconnectTimer)
  reconnectTimer = null
}

function isStubClient(client: ActiveClient): client is SupabaseStubClient {
  return !('realtime' in client)
}
