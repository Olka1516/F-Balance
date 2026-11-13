import { computed, onUnmounted, ref, type Ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { AI_PHOTO_ALLOWED_MIME, AI_PHOTO_MAX_INPUT_BYTES } from '@/constants/ai'
import { analyzeFoodPhoto, analyzeFoodText } from '@/services/ai'
import type { AiNutritionEstimate } from '@/types'
import { getAiCooldownRemainingMs } from '@/utils/aiCooldown'
import { resolveAiErrorI18nKey } from '@/utils/aiErrors'
import { emptyAiEstimate, isEmptyAiEstimate } from '@/utils/aiEstimate'
import { compressImageForAi } from '@/utils/aiImage'

const COOLDOWN_TICK_MS = 250
const MS_PER_SECOND = 1000
const DESCRIPTION_NAME_MAX_LENGTH = 80

type PreparedPhoto = { base64: string; mimeType: string }

/**
 * Runs AI nutrition estimates from a photo or a text description,
 * keeps the last photo so it can be re-analyzed with a clarification,
 * and exposes loading, error and cooldown state for the Add Food screens.
 */
export function useMealAiAnalysis(options: {
  locale: Ref<string>
  onEstimated: (estimate: AiNutritionEstimate) => void
}) {
  const { t } = useI18n()
  const isAnalyzing = ref(false)
  const errorMessage = ref('')
  const cooldownSeconds = ref(0)
  const photo = ref<PreparedPhoto | null>(null)
  const photoPreviewUrl = ref('')
  const lastText = ref('')
  let cooldownTimer: ReturnType<typeof setInterval> | undefined

  const source = computed<'photo' | 'text' | null>(() => {
    if (photo.value) {
      return 'photo'
    }

    return lastText.value ? 'text' : null
  })

  onUnmounted(() => {
    clearInterval(cooldownTimer)
    revokePreview()
  })

  function revokePreview(): void {
    if (photoPreviewUrl.value) {
      URL.revokeObjectURL(photoPreviewUrl.value)
      photoPreviewUrl.value = ''
    }
  }

  function startCooldownCountdown(): void {
    clearInterval(cooldownTimer)
    const tick = () => {
      cooldownSeconds.value = Math.ceil(getAiCooldownRemainingMs() / MS_PER_SECOND)

      if (cooldownSeconds.value <= 0) {
        clearInterval(cooldownTimer)
      }
    }
    tick()
    cooldownTimer = setInterval(tick, COOLDOWN_TICK_MS)
  }

  function isAcceptedImage(file: File): boolean {
    const typeOk =
      !file.type ||
      (AI_PHOTO_ALLOWED_MIME as readonly string[]).includes(file.type) ||
      /^image\//.test(file.type)

    return typeOk && file.size <= AI_PHOTO_MAX_INPUT_BYTES
  }

  async function run(task: () => Promise<void>): Promise<void> {
    if (isAnalyzing.value) {
      return
    }

    errorMessage.value = ''
    isAnalyzing.value = true

    try {
      await task()
    } catch (error) {
      errorMessage.value = t(resolveAiErrorI18nKey(error instanceof Error ? error.message : 'unknown'))
    } finally {
      isAnalyzing.value = false

      if (errorMessage.value) {
        startCooldownCountdown()
      }
    }
  }

  function emitResult(data: AiNutritionEstimate, fallbackName: string | null): void {
    if (isEmptyAiEstimate(data)) {
      options.onEstimated(emptyAiEstimate(data.cached))
      return
    }

    options.onEstimated({ ...data, name: data.name ?? fallbackName })
  }

  async function analyzePhoto(clarification: string): Promise<void> {
    const prepared = photo.value

    if (!prepared) {
      errorMessage.value = t('meals.ai.errors.invalidImage')
      return
    }

    const result = await analyzeFoodPhoto({
      imageBase64: prepared.base64,
      mimeType: prepared.mimeType,
      locale: options.locale.value,
      clarification: clarification.trim() || undefined,
    })

    if (!result.ok) {
      errorMessage.value = t(resolveAiErrorI18nKey(result.code))
      return
    }

    emitResult(result.data, null)
  }

  async function analyzeText(description: string): Promise<void> {
    const text = description.trim()
    const result = await analyzeFoodText(text, options.locale.value)

    if (!result.ok) {
      errorMessage.value = t(resolveAiErrorI18nKey(result.code))
      return
    }

    emitResult(result.data, text.slice(0, DESCRIPTION_NAME_MAX_LENGTH) || null)
  }

  /**
   * Compresses a camera or gallery image, keeps a preview, and analyzes it.
   */
  function submitPhoto(file: File, clarification: string): Promise<void> {
    return run(async () => {
      if (!isAcceptedImage(file)) {
        errorMessage.value = t('meals.ai.errors.invalidImage')
        return
      }

      photo.value = await compressImageForAi(file)
      lastText.value = ''
      revokePreview()
      photoPreviewUrl.value = URL.createObjectURL(file)
      await analyzePhoto(clarification)
    })
  }

  /**
   * Analyzes a typed or dictated meal description.
   */
  function submitText(description: string): Promise<void> {
    return run(async () => {
      photo.value = null
      revokePreview()
      lastText.value = description.trim()
      await analyzeText(description)
    })
  }

  /**
   * Re-runs the last analysis with an extra clarification from the user.
   */
  function refine(clarification: string): Promise<void> {
    return run(async () => {
      if (photo.value) {
        await analyzePhoto(clarification)
        return
      }

      const note = clarification.trim()
      await analyzeText(note ? `${lastText.value}. ${note}` : lastText.value)
    })
  }

  function clearError(): void {
    errorMessage.value = ''
  }

  return {
    isAnalyzing,
    errorMessage,
    cooldownSeconds,
    photoPreviewUrl,
    source,
    submitPhoto,
    submitText,
    refine,
    clearError,
  }
}
