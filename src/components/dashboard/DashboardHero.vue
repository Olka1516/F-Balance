<template>
  <section class="dashboard-hero" :aria-label="t('dashboard.hero.aria')">
    <span
      v-for="index in DASHBOARD_HERO_SPARKLE_COUNT"
      :key="index"
      class="dashboard-hero__sparkle"
      :class="`dashboard-hero__sparkle--${index}`"
      aria-hidden="true"
      v-html="sparkleSvg"
    />

    <h1 class="dashboard-hero__title">{{ title }}</h1>

    <div class="dashboard-hero__stats">
      <p class="dashboard-hero__stat">
        <span class="dashboard-hero__stat-value">{{ formatNumber(consumedCalories) }}</span>
        <span class="dashboard-hero__stat-label">{{ t('dashboard.summary.consumed') }}</span>
      </p>

      <div class="dashboard-hero__ring" role="img" :aria-label="ringAriaLabel">
        <svg
          class="dashboard-hero__ring-svg"
          :viewBox="`0 0 ${DASHBOARD_RING_VIEWBOX_SIZE} ${DASHBOARD_RING_VIEWBOX_SIZE}`"
          aria-hidden="true"
        >
          <circle
            class="dashboard-hero__ring-track"
            :cx="ringCenter"
            :cy="ringCenter"
            :r="DASHBOARD_RING_RADIUS"
            fill="none"
            :stroke-width="DASHBOARD_RING_STROKE_WIDTH"
          />
          <circle
            class="dashboard-hero__ring-progress"
            :cx="ringCenter"
            :cy="ringCenter"
            :r="DASHBOARD_RING_RADIUS"
            fill="none"
            :stroke-width="DASHBOARD_RING_STROKE_WIDTH"
            :stroke-dasharray="DASHBOARD_RING_CIRCUMFERENCE"
            :stroke-dashoffset="progressOffset"
            :transform="`rotate(-90 ${ringCenter} ${ringCenter})`"
          />
        </svg>
        <div class="dashboard-hero__ring-label">
          <span class="dashboard-hero__ring-value">{{ remainingDisplay }}</span>
          <span class="dashboard-hero__ring-caption">{{ remainingCaption }}</span>
        </div>
      </div>

      <p class="dashboard-hero__stat">
        <span class="dashboard-hero__stat-value">{{ targetDisplay }}</span>
        <span class="dashboard-hero__stat-label">{{ t('dashboard.summary.target') }}</span>
      </p>
    </div>

    <p v-if="targetCalories == null" class="dashboard-hero__hint">
      {{ t('dashboard.summary.noTarget') }}
    </p>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import sparkleSvg from '@/assets/decor/sparkle.svg?raw'
import {
  DASHBOARD_HERO_SPARKLE_COUNT,
  DASHBOARD_RING_CIRCUMFERENCE,
  DASHBOARD_RING_RADIUS,
  DASHBOARD_RING_STROKE_WIDTH,
  DASHBOARD_RING_VIEWBOX_SIZE,
} from '@/constants/dashboard'
import '@/styles/components/dashboard-hero.css'

const props = defineProps<{
  title: string
  targetCalories: number | null
  consumedCalories: number
}>()

const { t } = useI18n()
const ringCenter = DASHBOARD_RING_VIEWBOX_SIZE / 2
const EMPTY_VALUE = '—'

const remaining = computed(() =>
  props.targetCalories == null
    ? null
    : Math.round(props.targetCalories - props.consumedCalories),
)

const isOver = computed(() => remaining.value != null && remaining.value < 0)

const remainingDisplay = computed(() =>
  remaining.value == null ? EMPTY_VALUE : formatNumber(Math.abs(remaining.value)),
)

const remainingCaption = computed(() =>
  isOver.value ? t('dashboard.hero.over') : t('dashboard.hero.left'),
)

const targetDisplay = computed(() =>
  props.targetCalories == null ? EMPTY_VALUE : formatNumber(props.targetCalories),
)

const ringAriaLabel = computed(() =>
  t('dashboard.hero.ringAria', {
    consumed: formatNumber(props.consumedCalories),
    target: targetDisplay.value,
  }),
)

const progressOffset = computed(() => {
  const target = props.targetCalories

  if (target == null || target <= 0) {
    return DASHBOARD_RING_CIRCUMFERENCE
  }

  const ratio = Math.min(1, Math.max(0, props.consumedCalories / target))

  return DASHBOARD_RING_CIRCUMFERENCE * (1 - ratio)
})

function formatNumber(value: number): string {
  return String(Math.round(value))
}
</script>
