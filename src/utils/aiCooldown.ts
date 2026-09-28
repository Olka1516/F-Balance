import {
  AI_CLIENT_COOLDOWN_MS,
  AI_CLIENT_COOLDOWN_STORAGE_KEY,
} from '@/constants/ai'

/**
 * Remaining client-side AI cooldown in milliseconds.
 */
export function getAiCooldownRemainingMs(now = Date.now()): number {
  try {
    const raw = localStorage.getItem(AI_CLIENT_COOLDOWN_STORAGE_KEY)

    if (!raw) {
      return 0
    }

    const lastAt = Number(raw)

    if (!Number.isFinite(lastAt)) {
      return 0
    }

    return Math.max(0, AI_CLIENT_COOLDOWN_MS - (now - lastAt))
  } catch {
    return 0
  }
}

/**
 * Marks the current time as the last AI request for client cooldown.
 */
export function markAiRequestNow(now = Date.now()): void {
  try {
    localStorage.setItem(AI_CLIENT_COOLDOWN_STORAGE_KEY, String(now))
  } catch {
    return
  }
}
