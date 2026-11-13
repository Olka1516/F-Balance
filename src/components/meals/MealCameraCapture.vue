<template>
  <div class="meal-camera">
    <video
      v-show="status === 'ready'"
      ref="videoRef"
      class="meal-camera__video"
      :class="{ 'meal-camera__video--mirrored': facing === 'user' }"
      autoplay
      muted
      playsinline
    />

    <div v-if="status === 'ready'" class="meal-camera__frame" aria-hidden="true">
      <span v-for="corner in FRAME_CORNERS" :key="corner" :class="`meal-camera__corner meal-camera__corner--${corner}`" />
    </div>

    <div v-else class="meal-camera__fallback">
      <p class="meal-camera__fallback-text" role="status">
        {{ fallbackText }}
      </p>
      <div v-if="status !== 'starting'" class="meal-camera__fallback-actions">
        <AppButton type="button" :disabled="analyzing" @click="systemCameraInput?.click()">
          {{ t('meals.ai.takePhoto') }}
        </AppButton>
        <button type="button" class="meal-camera__text-button" :disabled="analyzing" @click="start">
          {{ t('meals.camera.retry') }}
        </button>
      </div>
    </div>

    <button
      v-if="torchSupported"
      type="button"
      class="meal-camera__round meal-camera__torch"
      :class="{ 'meal-camera__round--on': torchOn }"
      :aria-pressed="torchOn"
      :aria-label="t('meals.camera.flash')"
      @click="toggleTorch"
    >
      <span class="meal-camera__icon" aria-hidden="true" v-html="iconFlash" />
    </button>

    <div v-if="analyzing" class="meal-camera__busy" role="status">
      <AppLoader />
      <span>{{ t('meals.ai.analyzing') }}</span>
    </div>

    <div class="meal-camera__controls app-dark">
      <p v-if="status === 'ready' && !analyzing" class="meal-camera__hint">{{ t('meals.camera.hint') }}</p>
      <label class="meal-camera__note">
        <span class="meal-camera__visually-hidden">{{ t('meals.ai.clarificationLabel') }}</span>
        <input
          v-model="clarification"
          class="meal-camera__note-input"
          type="text"
          :maxlength="AI_CLARIFICATION_MAX_LENGTH"
          :placeholder="t('meals.camera.notePlaceholder')"
          :disabled="analyzing"
        />
        <MealSpeechButton v-model="clarification" :disabled="analyzing" />
      </label>

      <div class="meal-camera__row">
        <button
          type="button"
          class="meal-camera__round meal-camera__gallery"
          :aria-label="t('meals.ai.chooseGallery')"
          :disabled="analyzing"
          @click="galleryInput?.click()"
        >
          <span class="meal-camera__icon" aria-hidden="true" v-html="iconGallery" />
        </button>

        <button
          type="button"
          class="meal-camera__shutter"
          :aria-label="t('meals.camera.shoot')"
          :disabled="analyzing"
          @click="onShutter"
        >
          <span class="meal-camera__shutter-core" />
        </button>

        <button
          type="button"
          class="meal-camera__round"
          :aria-label="t('meals.camera.switch')"
          :disabled="analyzing || status !== 'ready'"
          @click="switchFacing"
        >
          <span class="meal-camera__icon" aria-hidden="true" v-html="iconFlip" />
        </button>
      </div>
    </div>

    <input
      ref="systemCameraInput"
      class="meal-camera__visually-hidden"
      type="file"
      accept="image/*"
      capture="environment"
      tabindex="-1"
      @change="onFileChange"
    />
    <input
      ref="galleryInput"
      class="meal-camera__visually-hidden"
      type="file"
      :accept="AI_PHOTO_ALLOWED_MIME.join(',')"
      tabindex="-1"
      @change="onFileChange"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import iconFlash from '@/assets/icons/flash.svg?raw'
import iconFlip from '@/assets/icons/flip.svg?raw'
import iconGallery from '@/assets/icons/gallery.svg?raw'
import AppButton from '@/components/common/AppButton.vue'
import AppLoader from '@/components/common/AppLoader.vue'
import MealSpeechButton from '@/components/meals/MealSpeechButton.vue'
import { useCameraStream } from '@/composables/useCameraStream'
import { AI_CLARIFICATION_MAX_LENGTH, AI_PHOTO_ALLOWED_MIME } from '@/constants/ai'
import '@/styles/components/meal-camera.css'

defineProps<{
  analyzing: boolean
}>()

const emit = defineEmits<{
  photo: [file: File]
}>()

const clarification = defineModel<string>('clarification', { required: true })

const FRAME_CORNERS = ['tl', 'tr', 'bl', 'br'] as const

const { t } = useI18n()
const videoRef = ref<HTMLVideoElement | null>(null)
const systemCameraInput = ref<HTMLInputElement | null>(null)
const galleryInput = ref<HTMLInputElement | null>(null)
const { status, facing, torchSupported, torchOn, start, switchFacing, toggleTorch, capture } =
  useCameraStream(videoRef)

const fallbackText = computed(() => {
  if (status.value === 'starting' || status.value === 'idle') {
    return t('meals.camera.starting')
  }

  return status.value === 'denied' ? t('meals.camera.denied') : t('meals.camera.unavailable')
})

onMounted(start)

async function onShutter(): Promise<void> {
  if (status.value !== 'ready') {
    systemCameraInput.value?.click()
    return
  }

  const file = await capture(t('meals.ai.capturedPhotoName'))

  if (file) {
    emit('photo', file)
  }
}

function onFileChange(event: Event): void {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''

  if (file) {
    emit('photo', file)
  }
}
</script>
