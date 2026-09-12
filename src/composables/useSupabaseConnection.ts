import { computed, readonly, ref } from 'vue'
import {
  connectSupabase,
  disconnectSupabase,
  getSupabaseConnectionStatus,
  getSupabaseLastErrorCode,
  getSupabaseReadiness,
  isSupabaseConnected,
  reconnectSupabase,
  type SupabaseErrorCode,
} from '@/services/supabase'
import type { SupabaseConnectionStatus } from '@/constants/supabase'

const status = ref<SupabaseConnectionStatus>(getSupabaseConnectionStatus())
const lastErrorCode = ref<SupabaseErrorCode | null>(getSupabaseLastErrorCode())

/**
 * Frontend-facing Supabase connection state and controls.
 */
export function useSupabaseConnection() {
  const isReady = computed(() => isSupabaseConnected())

  /**
   * Syncs local reactive status from the connection module.
   */
  function syncStatus(): void {
    status.value = getSupabaseConnectionStatus()
    lastErrorCode.value = getSupabaseLastErrorCode()
  }

  /**
   * Connects Supabase from the frontend entrypoint.
   */
  async function connect(): Promise<boolean> {
    const connected = await connectSupabase()
    syncStatus()
    return connected
  }

  /**
   * Disconnects the frontend Supabase client.
   */
  async function disconnect(): Promise<void> {
    await disconnectSupabase()
    syncStatus()
  }

  /**
   * Retries the Supabase connection from the frontend.
   */
  async function reconnect(): Promise<boolean> {
    const connected = await reconnectSupabase()
    syncStatus()
    return connected
  }

  /**
   * Returns readiness for UI forms before calling auth/DB APIs.
   */
  function getReadiness() {
    syncStatus()
    return getSupabaseReadiness()
  }

  return {
    status: readonly(status),
    lastErrorCode: readonly(lastErrorCode),
    isReady,
    connect,
    disconnect,
    reconnect,
    getReadiness,
    syncStatus,
  }
}
