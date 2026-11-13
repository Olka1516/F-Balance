<template>
  <span v-if="isSupported" class="meal-speech" :class="`meal-speech--${size}`">
    <span v-if="isListening && size === 'large'" class="meal-speech__pulse" aria-hidden="true" />
    <button
      type="button"
      class="meal-speech__button"
      :class="{ 'meal-speech__button--active': isListening }"
      :aria-pressed="isListening"
      :aria-label="isListening ? t('meals.ai.voice.stop') : t('meals.ai.voice.start')"
      :disabled="disabled"
      @click="toggleListening"
    >
      <span class="meal-speech__icon" aria-hidden="true" v-html="iconMic" />
    </button>
    <span v-if="speechError" class="meal-speech__error" role="status">{{ speechError }}</span>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import iconMic from '@/assets/icons/mic.svg?raw'
import { useSpeechToText } from '@/composables/useSpeechToText'
import '@/styles/components/meal-speech.css'

const text = defineModel<string>({ required: true })

withDefaults(
  defineProps<{
    size?: 'small' | 'large'
    disabled?: boolean
  }>(),
  { size: 'small', disabled: false },
)

const { t, locale } = useI18n()

const { isListening, isSupported, errorCode, toggleListening, stopListening } = useSpeechToText({
  lang: () => String(locale.value),
  getBaseText: () => text.value,
  onDraft: (draft) => {
    text.value = draft
  },
})

const speechError = computed(() =>
  errorCode.value ? t(`meals.ai.voice.errors.${errorCode.value}`) : '',
)

defineExpose({ stop: stopListening })
</script>
