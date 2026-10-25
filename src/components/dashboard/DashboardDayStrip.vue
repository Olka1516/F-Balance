<template>
  <section class="dashboard-day-strip" :aria-label="ariaLabel">
    <div class="dashboard-day-strip__month-row">
      <p class="dashboard-day-strip__month">{{ monthLabel }}</p>
      <div class="dashboard-day-strip__nav">
        <button
          type="button"
          class="dashboard-day-strip__nav-btn"
          :aria-label="prevLabel"
          @click="shiftWeek(-1)"
        >
          ‹
        </button>
        <button
          type="button"
          class="dashboard-day-strip__nav-btn"
          :aria-label="nextLabel"
          @click="shiftWeek(1)"
        >
          ›
        </button>
      </div>
    </div>

    <div class="dashboard-day-strip__days" role="listbox" :aria-label="ariaLabel">
      <button
        v-for="day in days"
        :key="day.key"
        type="button"
        role="option"
        class="dashboard-day-strip__day"
        :class="{
          'dashboard-day-strip__day--active': day.key === modelValue,
          'dashboard-day-strip__day--today': day.key === todayKey,
        }"
        :aria-selected="day.key === modelValue"
        @click="emit('update:modelValue', day.key)"
      >
        <span class="dashboard-day-strip__weekday">{{ day.weekday }}</span>
        <span class="dashboard-day-strip__date">{{ day.dayNumber }}</span>
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useLocale } from '@/composables/useLocale'
import {
  formatLocalDateKey,
  listWeekLocalDates,
  parseLocalDateKey,
  shiftLocalDateKey,
} from '@/utils/dashboard'
import '@/styles/components/dashboard-day-strip.css'

const props = defineProps<{
  modelValue: string
  ariaLabel: string
  prevLabel: string
  nextLabel: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const { currentLocale } = useLocale()
const todayKey = formatLocalDateKey(new Date())

const weekDates = computed(() => listWeekLocalDates(props.modelValue))

const monthLabel = computed(() => {
  const date = parseLocalDateKey(props.modelValue)

  return new Intl.DateTimeFormat(currentLocale.value, {
    month: 'long',
    year: 'numeric',
  }).format(date)
})

const days = computed(() =>
  weekDates.value.map((key) => {
    const date = parseLocalDateKey(key)

    return {
      key,
      weekday: new Intl.DateTimeFormat(currentLocale.value, {
        weekday: 'narrow',
      }).format(date),
      dayNumber: String(date.getDate()),
    }
  }),
)

function shiftWeek(direction: -1 | 1): void {
  emit('update:modelValue', shiftLocalDateKey(props.modelValue, direction * 7))
}
</script>
