<template>
  <section class="dashboard-progress-card" :aria-label="title">
    <h2 class="dashboard-progress-card__title">{{ title }}</h2>

    <div class="dashboard-progress-card__top">
      <div
        class="dashboard-progress-card__ring"
        role="img"
        :aria-label="ringAriaLabel"
      >
        <svg
          class="dashboard-progress-card__ring-svg"
          :viewBox="`0 0 ${DASHBOARD_RING_VIEWBOX_SIZE} ${DASHBOARD_RING_VIEWBOX_SIZE}`"
          aria-hidden="true"
        >
          <circle
            class="dashboard-progress-card__ring-track"
            :cx="ringCenter"
            :cy="ringCenter"
            :r="DASHBOARD_RING_RADIUS"
            fill="none"
            :stroke-width="DASHBOARD_RING_STROKE_WIDTH"
          />
          <circle
            class="dashboard-progress-card__ring-progress"
            :class="{ 'dashboard-progress-card__ring-progress--over': isOver }"
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
        <div class="dashboard-progress-card__ring-label">
          <span class="dashboard-progress-card__ring-caption">{{
            remainingCaption
          }}</span>
          <span
            class="dashboard-progress-card__ring-value"
            :class="{ 'dashboard-progress-card__ring-value--over': isOver }"
          >
            {{ remainingDisplay }}
          </span>
          <span class="dashboard-progress-card__ring-unit">{{ unitLabel }}</span>
        </div>
      </div>

      <div class="dashboard-progress-card__intake">
        <p class="dashboard-progress-card__intake-label">{{ eatenLabel }}</p>
        <p class="dashboard-progress-card__intake-value">
          {{ formatNumber(consumedCalories) }}
          <span>{{ unitLabel }}</span>
        </p>
        <p v-if="targetCalories != null" class="dashboard-progress-card__intake-target">
          {{ targetLabel }}: {{ formatNumber(targetCalories) }}
          {{ unitLabel }}
        </p>
        <p v-else class="dashboard-progress-card__intake-target">
          {{ noTargetLabel }}
        </p>
      </div>
    </div>

    <ul class="dashboard-progress-card__macros">
      <li
        v-for="macro in macros"
        :key="macro.key"
        class="dashboard-progress-card__macro"
        :class="{ 'dashboard-progress-card__macro--over': macro.isOver }"
      >
        <div class="dashboard-progress-card__macro-head">
          <span class="dashboard-progress-card__macro-name">{{ macro.label }}</span>
          <span class="dashboard-progress-card__macro-value">{{
            macro.valueText
          }}</span>
        </div>
        <div class="dashboard-progress-card__macro-track" aria-hidden="true">
          <span
            class="dashboard-progress-card__macro-fill"
            :class="`dashboard-progress-card__macro-fill--${macro.key}`"
            :style="{ width: `${macro.percent}%` }"
          />
        </div>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  DASHBOARD_RING_CIRCUMFERENCE,
  DASHBOARD_RING_RADIUS,
  DASHBOARD_RING_STROKE_WIDTH,
  DASHBOARD_RING_VIEWBOX_SIZE,
} from '@/constants/dashboard'
import { roundNutrition } from '@/utils/macros'
import '@/styles/components/dashboard-progress-card.css'

const props = defineProps<{
  title: string
  targetCalories: number | null
  consumedCalories: number
  protein: number
  fat: number
  carbs: number
  targetProtein: number | null
  targetFat: number | null
  targetCarbs: number | null
  remainingLabel: string
  overLabel: string
  eatenLabel: string
  targetLabel: string
  noTargetLabel: string
  unitLabel: string
  proteinLabel: string
  fatLabel: string
  carbsLabel: string
  gramsLabel: (value: number) => string
  ofTargetLabel: (value: number, target: number) => string
  ringAriaLabel: string
}>()

const ringCenter = DASHBOARD_RING_VIEWBOX_SIZE / 2

const remaining = computed(() => {
  if (props.targetCalories == null) {
    return null
  }

  return roundNutrition(props.targetCalories - props.consumedCalories)
})

const isOver = computed(
  () => remaining.value != null && remaining.value < 0,
)

const remainingCaption = computed(() =>
  isOver.value ? props.overLabel : props.remainingLabel,
)

const remainingDisplay = computed(() => {
  if (remaining.value == null) {
    return '—'
  }

  return formatNumber(Math.abs(remaining.value))
})

const progressRatio = computed(() => {
  if (props.targetCalories == null || props.targetCalories <= 0) {
    return 0
  }

  return Math.min(1, Math.max(0, props.consumedCalories / props.targetCalories))
})

const progressOffset = computed(
  () => DASHBOARD_RING_CIRCUMFERENCE * (1 - progressRatio.value),
)

const macros = computed(() => [
  buildMacro(
    'protein',
    props.proteinLabel,
    props.protein,
    props.targetProtein,
  ),
  buildMacro('fat', props.fatLabel, props.fat, props.targetFat),
  buildMacro('carbs', props.carbsLabel, props.carbs, props.targetCarbs),
])

function formatNumber(value: number): string {
  return String(roundNutrition(value))
}

function buildMacro(
  key: 'protein' | 'fat' | 'carbs',
  label: string,
  value: number,
  target: number | null,
) {
  const rounded = roundNutrition(value)
  const isMacroOver = target != null && rounded > target
  const percent =
    target == null || target <= 0
      ? rounded > 0
        ? 100
        : 0
      : Math.min(100, Math.round((rounded / target) * 100))

  return {
    key,
    label,
    isOver: isMacroOver,
    percent,
    valueText:
      target == null
        ? props.gramsLabel(rounded)
        : props.ofTargetLabel(rounded, roundNutrition(target)),
  }
}
</script>
