<template>
  <nav class="dashboard-date-nav" :aria-label="t('dashboard.dateNav.aria')">
    <button
      type="button"
      class="dashboard-date-nav__arrow"
      :aria-label="t('dashboard.dateNav.prev')"
      @click="shift(-1)"
    >
      <span class="dashboard-date-nav__icon" aria-hidden="true" v-html="iconChevronLeft" />
    </button>

    <label class="dashboard-date-nav__picker">
      <span class="dashboard-date-nav__icon" aria-hidden="true" v-html="iconCalendar" />
      <span class="dashboard-date-nav__label">{{ dateLabel }}</span>
      <input
        class="dashboard-date-nav__input"
        type="date"
        :value="modelValue"
        :max="todayKey"
        :aria-label="t('dashboard.dateNav.pick')"
        @change="onPick"
      />
    </label>

    <button
      type="button"
      class="dashboard-date-nav__arrow"
      :aria-label="t('dashboard.dateNav.next')"
      :disabled="isToday"
      @click="shift(1)"
    >
      <span class="dashboard-date-nav__icon" aria-hidden="true" v-html="iconChevronRight" />
    </button>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import iconCalendar from '@/assets/icons/calendar.svg?raw'
import iconChevronLeft from '@/assets/icons/chevron-left.svg?raw'
import iconChevronRight from '@/assets/icons/chevron-right.svg?raw'
import { useLocale } from '@/composables/useLocale'
import {
  formatLocalDateKey,
  parseLocalDateKey,
  shiftLocalDateKey,
} from '@/utils/dashboard'
import '@/styles/components/dashboard-date-nav.css'

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const { t } = useI18n()
const { currentLocale } = useLocale()
const todayKey = formatLocalDateKey(new Date())
const yesterdayKey = shiftLocalDateKey(todayKey, -1)

const isToday = computed(() => props.modelValue >= todayKey)

const dateLabel = computed(() => {
  const formatted = new Intl.DateTimeFormat(currentLocale.value, {
    day: 'numeric',
    month: 'long',
  }).format(parseLocalDateKey(props.modelValue))

  if (props.modelValue === todayKey) {
    return `${t('dashboard.title')}, ${formatted}`
  }

  if (props.modelValue === yesterdayKey) {
    return `${t('dashboard.dateNav.yesterday')}, ${formatted}`
  }

  return formatted
})

function shift(delta: number): void {
  const next = shiftLocalDateKey(props.modelValue, delta)

  if (next <= todayKey) {
    emit('update:modelValue', next)
  }
}

function onPick(event: Event): void {
  const value = (event.target as HTMLInputElement).value

  if (value && value <= todayKey) {
    emit('update:modelValue', value)
  }
}
</script>
