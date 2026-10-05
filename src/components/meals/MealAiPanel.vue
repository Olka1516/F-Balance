<template>
  <div class="meal-ai-panel">
    <p class="meal-ai-panel__disclaimer">
      {{ t('meals.ai.disclaimer') }}
    </p>

    <div class="meal-ai-panel__modes" role="tablist">
      <button
        type="button"
        class="meal-ai-panel__mode"
        :class="{ 'meal-ai-panel__mode--active': mode === 'text' }"
        @click="mode = 'text'"
      >
        {{ t('meals.ai.modes.text') }}
      </button>
      <button
        type="button"
        class="meal-ai-panel__mode"
        :class="{ 'meal-ai-panel__mode--active': mode === 'photo' }"
        @click="mode = 'photo'"
      >
        {{ t('meals.ai.modes.photo') }}
      </button>
    </div>

    <template v-if="mode === 'text'">
      <label class="meal-ai-panel__label" for="meal-ai-description">
        {{ t('meals.ai.descriptionLabel') }}
      </label>
      <textarea
        id="meal-ai-description"
        v-model="description"
        class="meal-ai-panel__textarea"
        rows="4"
        :placeholder="t('meals.ai.descriptionPlaceholder')"
        :maxlength="AI_TEXT_MAX_LENGTH"
      />
    </template>

    <template v-else>
      <p class="meal-ai-panel__label" id="meal-ai-photo-label">
        {{ t('meals.ai.photoLabel') }}
      </p>
      <div
        class="meal-ai-panel__photo-actions"
        role="group"
        :aria-labelledby="'meal-ai-photo-label'"
      >
        <AppButton
          type="button"
          :variant="APP_BUTTON_VARIANT.secondary"
          :disabled="isAnalyzing"
          @click="openCameraPicker"
        >
          {{ t('meals.ai.takePhoto') }}
        </AppButton>
        <AppButton
          type="button"
          :variant="APP_BUTTON_VARIANT.secondary"
          :disabled="isAnalyzing"
          @click="openGalleryPicker"
        >
          {{ t('meals.ai.chooseGallery') }}
        </AppButton>
      </div>
      <input
        ref="cameraInput"
        class="meal-ai-panel__file meal-ai-panel__file--hidden"
        type="file"
        accept="image/*"
        capture="environment"
        @change="onPhotoChange"
      />
      <input
        ref="galleryInput"
        class="meal-ai-panel__file meal-ai-panel__file--hidden"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        @change="onPhotoChange"
      />
      <p v-if="photoName" class="meal-ai-panel__file-name">
        {{ photoName }}
      </p>
    </template>

    <p
      v-if="errorMessage"
      class="app-page__message app-page__message--error"
      role="alert"
    >
      {{ errorMessage }}
    </p>

    <AppButton
      type="button"
      :loading="isAnalyzing"
      :disabled="isAnalyzing || !canAnalyze"
      @click="onAnalyze"
    >
      {{ isAnalyzing ? t('meals.ai.analyzing') : t('meals.ai.analyze') }}
    </AppButton>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import AppButton from '@/components/common/AppButton.vue'
import {
  AI_PHOTO_ALLOWED_MIME,
  AI_PHOTO_MAX_INPUT_BYTES,
  AI_TEXT_MAX_LENGTH,
  AI_TEXT_MIN_LENGTH,
} from '@/constants/ai'
import { APP_BUTTON_VARIANT } from '@/constants/ui'
import { analyzeFoodPhoto, analyzeFoodText } from '@/services/ai'
import type { AiNutritionEstimate } from '@/types'
import { resolveAiErrorI18nKey } from '@/utils/aiErrors'
import { emptyAiEstimate, isEmptyAiEstimate } from '@/utils/aiEstimate'
import { compressImageForAi } from '@/utils/aiImage'
import '@/styles/components/meal-ai-panel.css'

const emit = defineEmits<{
  estimated: [payload: AiNutritionEstimate]
}>()

const { t, locale } = useI18n()
const mode = ref<'text' | 'photo'>('text')
const description = ref('')
const photoFile = ref<File | null>(null)
const photoName = ref('')
const isAnalyzing = ref(false)
const errorMessage = ref('')
const cameraInput = ref<HTMLInputElement | null>(null)
const galleryInput = ref<HTMLInputElement | null>(null)

const canAnalyze = computed(() => {
  if (mode.value === 'text') {
    const length = description.value.trim().length
    return length >= AI_TEXT_MIN_LENGTH && length <= AI_TEXT_MAX_LENGTH
  }

  return Boolean(photoFile.value)
})

function openCameraPicker(): void {
  errorMessage.value = ''
  cameraInput.value?.click()
}

function openGalleryPicker(): void {
  errorMessage.value = ''
  galleryInput.value?.click()
}

function onPhotoChange(event: Event): void {
  errorMessage.value = ''
  const input = event.target as HTMLInputElement
  const file = input.files?.[0] ?? null

  if (!file) {
    photoFile.value = null
    photoName.value = ''
    return
  }

const mimeOk =
    !file.type ||
    file.type === 'image/jpg' ||
    (AI_PHOTO_ALLOWED_MIME as readonly string[]).includes(file.type) ||
    /^image\//.test(file.type)

  if (!mimeOk || file.size > AI_PHOTO_MAX_INPUT_BYTES) {
    photoFile.value = null
    photoName.value = ''
    errorMessage.value = t('meals.ai.errors.invalidImage')
    input.value = ''
    return
  }

  photoFile.value = file
  photoName.value = file.name || t('meals.ai.capturedPhotoName')
  input.value = ''
}

async function onAnalyze(): Promise<void> {
  errorMessage.value = ''
  isAnalyzing.value = true

  try {
    const activeLocale = String(locale.value)

    if (mode.value === 'text') {
      const result = await analyzeFoodText(
        description.value.trim(),
        activeLocale,
      )

      if (!result.ok) {
        errorMessage.value = t(resolveAiErrorI18nKey(result.code))
        return
      }

      if (isEmptyAiEstimate(result.data)) {
        emit('estimated', emptyAiEstimate(result.data.cached))
        return
      }

      emit('estimated', {
        ...result.data,
        name:
          result.data.name ??
          description.value.trim().slice(0, 80) ??
          null,
      })
      return
    }

    const file = photoFile.value

    if (!file) {
      errorMessage.value = t('meals.ai.errors.invalidImage')
      return
    }

    const compressed = await compressImageForAi(file)
    const result = await analyzeFoodPhoto({
      imageBase64: compressed.base64,
      mimeType: compressed.mimeType,
      locale: activeLocale,
    })

    if (!result.ok) {
      errorMessage.value = t(resolveAiErrorI18nKey(result.code))
      return
    }

    if (isEmptyAiEstimate(result.data)) {
      emit('estimated', emptyAiEstimate(result.data.cached))
      return
    }

    emit('estimated', result.data)
  } catch (error) {
    const code = error instanceof Error ? error.message : 'unknown'
    errorMessage.value = t(resolveAiErrorI18nKey(code))
  } finally {
    isAnalyzing.value = false
  }
}
</script>
