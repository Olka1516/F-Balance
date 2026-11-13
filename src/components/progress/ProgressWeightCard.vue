<template>
  <section class="progress-weight" :aria-label="t('dashboard.progressPage.weightTitle')">
    <div class="progress-weight__text">
      <p class="progress-weight__label">{{ t('dashboard.progressPage.weightTitle') }}</p>
      <p class="progress-weight__value">
        {{ weight == null ? '—' : t('dashboard.progressPage.kg', { value: format(weight) }) }}
      </p>
      <p class="progress-weight__meta">{{ meta }}</p>
    </div>
    <button
      type="button"
      class="progress-weight__add"
      :aria-label="t('dashboard.progressPage.updateWeight')"
      @click="emit('update')"
    >
      <span class="progress-weight__icon" aria-hidden="true" v-html="iconPlus" />
    </button>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import iconPlus from '@/assets/icons/plus.svg?raw'
import { useLocale } from '@/composables/useLocale'
import '@/styles/components/progress-weight.css'

const props = defineProps<{
  weight: number | null
  targetWeight: number | null
}>()

const emit = defineEmits<{
  update: []
}>()

const { t } = useI18n()
const { currentLocale } = useLocale()

const meta = computed(() => {
  if (props.weight == null) {
    return t('dashboard.progressPage.weightMissing')
  }

  if (props.targetWeight == null) {
    return t('dashboard.progressPage.weightNoTarget')
  }

  const diff = props.targetWeight - props.weight

  if (Math.abs(diff) < 0.1) {
    return t('dashboard.progressPage.weightReached')
  }

  return t('dashboard.progressPage.weightToTarget', {
    value: format(Math.abs(diff)),
    target: format(props.targetWeight),
  })
})

function format(value: number): string {
  return new Intl.NumberFormat(currentLocale.value, { maximumFractionDigits: 1 }).format(value)
}
</script>
