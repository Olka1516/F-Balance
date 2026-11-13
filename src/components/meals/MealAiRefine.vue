<template>
  <div class="meal-ai-refine">
    <label class="meal-ai-refine__field">
      <span class="meal-ai-refine__visually-hidden">{{ t('meals.ai.clarificationLabel') }}</span>
      <input
        v-model="note"
        class="meal-ai-refine__input"
        type="text"
        :maxlength="AI_CLARIFICATION_MAX_LENGTH"
        :placeholder="t('meals.ai.clarificationPlaceholder')"
        :disabled="analyzing"
        @keydown.enter.prevent="submit"
      />
      <MealSpeechButton ref="speechRef" v-model="note" :disabled="analyzing" />
      <button
        type="button"
        class="meal-ai-refine__submit"
        :aria-label="cooldownSeconds > 0 ? t('meals.ai.retryIn', { seconds: cooldownSeconds }) : t('meals.ai.retry')"
        :disabled="analyzing || cooldownSeconds > 0"
        @click="submit"
      >
        <span class="meal-ai-refine__icon" :class="{ 'meal-ai-refine__icon--spin': analyzing }" aria-hidden="true" v-html="iconRefresh" />
      </button>
    </label>
    <p v-if="analyzing" class="meal-ai-refine__status" role="status">{{ t('meals.ai.analyzing') }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import iconRefresh from '@/assets/icons/refresh.svg?raw'
import MealSpeechButton from '@/components/meals/MealSpeechButton.vue'
import { AI_CLARIFICATION_MAX_LENGTH } from '@/constants/ai'
import '@/styles/components/meal-ai-refine.css'

defineProps<{
  analyzing: boolean
  cooldownSeconds: number
}>()

const emit = defineEmits<{
  refine: [note: string]
}>()

const { t } = useI18n()
const note = ref('')
const speechRef = ref<{ stop: () => void } | null>(null)

function submit(): void {
  speechRef.value?.stop()
  emit('refine', note.value)
}
</script>
