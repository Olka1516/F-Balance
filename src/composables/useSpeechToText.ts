import { computed, onBeforeUnmount, ref, type Ref } from 'vue'

type SpeechRecognitionLike = {
  lang: string
  continuous: boolean
  interimResults: boolean
  start: () => void
  stop: () => void
  abort: () => void
  onresult: ((event: SpeechRecognitionResultEventLike) => void) | null
  onerror: ((event: { error?: string }) => void) | null
  onend: (() => void) | null
}

type SpeechRecognitionResultEventLike = {
  resultIndex: number
  results: ArrayLike<{
    isFinal: boolean
    0: { transcript: string }
  }>
}

type SpeechRecognitionCtor = new () => SpeechRecognitionLike

/**
 * Browser speech-to-text helper for AI meal descriptions.
 * Replaces the live draft during one utterance instead of appending interim chunks.
 */
export function useSpeechToText(options: {
  lang: Ref<string> | (() => string)
  getBaseText: () => string
  onDraft: (text: string) => void
}) {
  const isListening = ref(false)
  const isSupported = ref(false)
  const errorCode = ref<'unsupported' | 'denied' | 'unavailable' | null>(null)
  let recognition: SpeechRecognitionLike | null = null
  let sessionBase = ''

  const SpeechRecognitionApi = getSpeechRecognitionCtor()
  isSupported.value = Boolean(SpeechRecognitionApi)

  function resolveLang(): string {
    const raw =
      typeof options.lang === 'function' ? options.lang() : options.lang.value
    return raw === 'uk' ? 'uk-UA' : 'en-US'
  }

  function joinText(base: string, spoken: string): string {
    const left = base.trim()
    const right = spoken.trim()

    if (!left) {
      return right
    }

    if (!right) {
      return left
    }

    return `${left} ${right}`
  }

  function ensureRecognition(): SpeechRecognitionLike | null {
    if (!SpeechRecognitionApi) {
      errorCode.value = 'unsupported'
      return null
    }

    if (recognition) {
      return recognition
    }

    recognition = new SpeechRecognitionApi()
    recognition.continuous = false
    recognition.interimResults = true
    recognition.onresult = (event) => {
      let spoken = ''

      for (let index = 0; index < event.results.length; index += 1) {
        spoken += event.results[index]?.[0]?.transcript ?? ''
      }

      options.onDraft(joinText(sessionBase, spoken))
    }
    recognition.onerror = (event) => {
      isListening.value = false

      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        errorCode.value = 'denied'
        return
      }

      if (event.error === 'aborted') {
        return
      }

      errorCode.value = 'unavailable'
    }
    recognition.onend = () => {
      isListening.value = false
    }

    return recognition
  }

  /**
   * Starts or stops the active speech recognition session.
   */
  function toggleListening(): void {
    errorCode.value = null
    const active = ensureRecognition()

    if (!active) {
      return
    }

    if (isListening.value) {
      active.stop()
      isListening.value = false
      return
    }

    sessionBase = options.getBaseText().trim()
    active.lang = resolveLang()

    try {
      active.start()
      isListening.value = true
    } catch {
      errorCode.value = 'unavailable'
      isListening.value = false
    }
  }

  /**
   * Stops recognition if it is still running.
   */
  function stopListening(): void {
    if (!recognition || !isListening.value) {
      return
    }

    recognition.stop()
    isListening.value = false
  }

  onBeforeUnmount(() => {
    if (!recognition) {
      return
    }

    recognition.onresult = null
    recognition.onerror = null
    recognition.onend = null
    recognition.abort()
    recognition = null
  })

  return {
    isListening,
    isSupported: computed(() => isSupported.value),
    errorCode,
    toggleListening,
    stopListening,
  }
}

function getSpeechRecognitionCtor(): SpeechRecognitionCtor | null {
  const scope = window as Window & {
    SpeechRecognition?: SpeechRecognitionCtor
    webkitSpeechRecognition?: SpeechRecognitionCtor
  }

  return scope.SpeechRecognition ?? scope.webkitSpeechRecognition ?? null
}
