<template>
  <div class="meal-describe">
    <label class="meal-describe__field">
      <span class="meal-describe__label">{{ t('meals.ai.descriptionLabel') }}</span>
      <textarea
        ref="textareaRef"
        v-model="description"
        class="meal-describe__textarea"
        :placeholder="t('meals.ai.descriptionPlaceholder')"
        :maxlength="AI_TEXT_MAX_LENGTH"
        :disabled="analyzing"
      />
    </label>

    <div class="meal-describe__actions">
      <button
        type="button"
        class="meal-describe__side"
        :aria-label="t('meals.ai.clearDescription')"
        :disabled="analyzing || !description.trim()"
        @click="clear"
      >
        <span class="meal-describe__icon" aria-hidden="true" v-html="iconClose" />
      </button>
      <MealSpeechButton ref="speechRef" v-model="description" size="large" :disabled="analyzing" />
      <button
        type="button"
        class="meal-describe__side meal-describe__side--primary"
        :aria-label="t('meals.ai.analyze')"
        :disabled="analyzing || !canAnalyze"
        @click="onAnalyze"
      >
        <span class="meal-describe__icon" aria-hidden="true" v-html="iconArrow" />
      </button>
    </div>

    <p v-if="analyzing" class="meal-describe__status" role="status">{{ t('meals.ai.analyzing') }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import iconArrow from '@/assets/icons/arrow-right.svg?raw'
import iconClose from '@/assets/icons/close.svg?raw'
import MealSpeechButton from '@/components/meals/MealSpeechButton.vue'
import { AI_TEXT_MAX_LENGTH, AI_TEXT_MIN_LENGTH } from '@/constants/ai'
import '@/styles/components/meal-describe.css'

defineProps<{
  analyzing: boolean
}>()

const emit = defineEmits<{
  analyze: [description: string]
}>()

const description = defineModel<string>({ required: true })

const { t } = useI18n()
const speechRef = ref<{ stop: () => void } | null>(null)
const textareaRef = ref<HTMLTextAreaElement | null>(null)

const canAnalyze = computed(() => {
  const length = description.value.trim().length
  return length >= AI_TEXT_MIN_LENGTH && length <= AI_TEXT_MAX_LENGTH
})

function clear(): void {
  speechRef.value?.stop()
  description.value = ''
  textareaRef.value?.focus()
}

function onAnalyze(): void {
  speechRef.value?.stop()
  emit('analyze', description.value)
}
</script>
