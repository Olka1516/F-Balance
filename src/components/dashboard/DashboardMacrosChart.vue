<template>
  <div class="dashboard-macros-chart">
    <div
      class="dashboard-macros-chart__canvas-wrap"
      role="img"
      :aria-label="ariaLabel"
      :style="chartSizeStyle"
    >
      <VChart
        v-if="hasMacros"
        class="dashboard-macros-chart__canvas"
        :option="option"
        autoresize
        :style="chartSizeStyle"
      />
      <p v-else class="dashboard-macros-chart__empty">
        {{ emptyLabel }}
      </p>
    </div>

    <p
      class="dashboard-macros-chart__status"
      :class="{
        'dashboard-macros-chart__status--over': isOverTarget,
      }"
      role="status"
    >
      {{ statusText }}
    </p>

    <ul v-if="hasMacros" class="dashboard-macros-chart__legend">
      <li
        v-for="item in legendItems"
        :key="item.key"
        class="dashboard-macros-chart__legend-item"
        :class="{ 'dashboard-macros-chart__legend-item--over': item.isOver }"
      >
        <span
          class="dashboard-macros-chart__swatch"
          :style="{ background: item.color }"
          aria-hidden="true"
        />
        <span class="dashboard-macros-chart__legend-label">{{ item.label }}</span>
        <span class="dashboard-macros-chart__legend-value">
          {{ item.valueText }}
        </span>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { PieChart } from 'echarts/charts'
import { TooltipComponent, LegendComponent } from 'echarts/components'
import VChart from 'vue-echarts'
import {
  DASHBOARD_CHART_ANIMATION_MS,
  DASHBOARD_CHART_HEIGHT_REM,
  MACRO_KCAL_CARBS,
  MACRO_KCAL_FAT,
  MACRO_KCAL_PROTEIN,
} from '@/constants/dashboard'
import { roundNutrition } from '@/utils/macros'
import '@/styles/components/dashboard-macros-chart.css'

use([CanvasRenderer, PieChart, TooltipComponent, LegendComponent])

const props = defineProps<{
  protein: number
  fat: number
  carbs: number
  targetProtein: number | null
  targetFat: number | null
  targetCarbs: number | null
  proteinLabel: string
  fatLabel: string
  carbsLabel: string
  gramsLabel: (value: number) => string
  ofTargetLabel: (value: number, target: number) => string
  kcalLabel: string
  emptyLabel: string
  withinLabel: string
  overLabel: string
  noTargetLabel: string
  ariaLabel: string
}>()

const proteinColor = ref('#c45c6a')
const fatColor = ref('#d4a017')
const carbsColor = ref('#3a7ca5')
const textColor = ref('#2e2218')

const chartSizeStyle = computed(() => ({
  height: `${DASHBOARD_CHART_HEIGHT_REM}rem`,
  minHeight: `${DASHBOARD_CHART_HEIGHT_REM}rem`,
}))

const hasMacros = computed(
  () => props.protein > 0 || props.fat > 0 || props.carbs > 0,
)

const hasMacroTargets = computed(
  () =>
    props.targetProtein != null ||
    props.targetFat != null ||
    props.targetCarbs != null,
)

const isOverTarget = computed(
  () =>
    isMacroOver(props.protein, props.targetProtein) ||
    isMacroOver(props.fat, props.targetFat) ||
    isMacroOver(props.carbs, props.targetCarbs),
)

const statusText = computed(() => {
  if (!hasMacroTargets.value) {
    return props.noTargetLabel
  }

  if (isOverTarget.value) {
    return props.overLabel
  }

  return props.withinLabel
})

const seriesColors = computed(() => [
  proteinColor.value,
  fatColor.value,
  carbsColor.value,
])

const legendItems = computed(() => [
  buildLegendItem(
    'protein',
    props.proteinLabel,
    seriesColors.value[0],
    props.protein,
    props.targetProtein,
    MACRO_KCAL_PROTEIN,
  ),
  buildLegendItem(
    'fat',
    props.fatLabel,
    seriesColors.value[1],
    props.fat,
    props.targetFat,
    MACRO_KCAL_FAT,
  ),
  buildLegendItem(
    'carbs',
    props.carbsLabel,
    seriesColors.value[2],
    props.carbs,
    props.targetCarbs,
    MACRO_KCAL_CARBS,
  ),
])

function isMacroOver(value: number, target: number | null): boolean {
  return target != null && value > target
}

function buildLegendItem(
  key: string,
  label: string,
  color: string,
  value: number,
  target: number | null,
  kcalPerGram: number,
) {
  const rounded = roundNutrition(value)
  const gramsText =
    target == null
      ? props.gramsLabel(rounded)
      : props.ofTargetLabel(rounded, roundNutrition(target))

  return {
    key,
    label,
    color,
    isOver: isMacroOver(value, target),
    valueText: `${gramsText} · ${roundNutrition(value * kcalPerGram)} ${props.kcalLabel}`,
  }
}

onMounted(() => {
  const styles = getComputedStyle(document.documentElement)
  proteinColor.value =
    styles.getPropertyValue('--color-macro-protein').trim() ||
    proteinColor.value
  fatColor.value =
    styles.getPropertyValue('--color-macro-fat').trim() || fatColor.value
  carbsColor.value =
    styles.getPropertyValue('--color-macro-carbs').trim() || carbsColor.value
  textColor.value =
    styles.getPropertyValue('--color-text').trim() || textColor.value
})

const option = computed(() => ({
  animationDuration: DASHBOARD_CHART_ANIMATION_MS,
  tooltip: {
    trigger: 'item',
    formatter: (params: {
      name: string
      value: number
      percent: number
    }) =>
      `${params.name}<br/>${props.gramsLabel(params.value)} · ${params.percent}%`,
  },
  series: [
    {
      type: 'pie',
      radius: ['42%', '70%'],
      center: ['50%', '50%'],
      avoidLabelOverlap: true,
      itemStyle: {
        borderRadius: 8,
        borderColor: 'transparent',
        borderWidth: 2,
      },
      label: {
        color: textColor.value,
        fontSize: 12,
        formatter: '{b}',
      },
      labelLine: {
        length: 10,
        length2: 8,
      },
      data: [
        {
          name: props.proteinLabel,
          value: roundNutrition(props.protein),
          itemStyle: { color: seriesColors.value[0] },
        },
        {
          name: props.fatLabel,
          value: roundNutrition(props.fat),
          itemStyle: { color: seriesColors.value[1] },
        },
        {
          name: props.carbsLabel,
          value: roundNutrition(props.carbs),
          itemStyle: { color: seriesColors.value[2] },
        },
      ].filter((item) => item.value > 0),
    },
  ],
}))
</script>
