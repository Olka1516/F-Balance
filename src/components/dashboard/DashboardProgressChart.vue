<template>
  <div
    class="dashboard-progress-chart"
    role="img"
    :aria-label="ariaLabel"
    :style="chartSizeStyle"
  >
    <VChart
      class="dashboard-progress-chart__canvas"
      :option="option"
      autoresize
      :style="chartSizeStyle"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart } from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
} from 'echarts/components'
import VChart from 'vue-echarts'
import {
  DASHBOARD_CHART_ANIMATION_MS,
  DASHBOARD_CHART_BAR_WIDTH,
  DASHBOARD_CHART_HEIGHT_REM,
} from '@/constants/dashboard'
import '@/styles/components/dashboard-progress-chart.css'

use([CanvasRenderer, BarChart, GridComponent, TooltipComponent])

const props = defineProps<{
  target: number
  consumed: number
  targetLabel: string
  consumedLabel: string
  unitLabel: string
  ariaLabel: string
}>()

const primaryColor = ref('#c45c26')
const accentColor = ref('#d4a017')
const mutedColor = ref('#7a6555')
const borderColor = ref('#e8d4b8')

const chartSizeStyle = computed(() => ({
  height: `${DASHBOARD_CHART_HEIGHT_REM}rem`,
  minHeight: `${DASHBOARD_CHART_HEIGHT_REM}rem`,
}))

onMounted(() => {
  const styles = getComputedStyle(document.documentElement)
  primaryColor.value =
    styles.getPropertyValue('--color-primary').trim() || primaryColor.value
  accentColor.value =
    styles.getPropertyValue('--color-accent').trim() || accentColor.value
  mutedColor.value =
    styles.getPropertyValue('--color-text-muted').trim() || mutedColor.value
  borderColor.value =
    styles.getPropertyValue('--color-border').trim() || borderColor.value
})

const option = computed(() => ({
  animationDuration: DASHBOARD_CHART_ANIMATION_MS,
  grid: {
    left: 8,
    right: 8,
    top: 28,
    bottom: 8,
    containLabel: true,
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: { type: 'shadow' },
    valueFormatter: (value: number) => `${value} ${props.unitLabel}`,
  },
  xAxis: {
    type: 'category',
    data: [props.consumedLabel, props.targetLabel],
    axisTick: { show: false },
    axisLine: { lineStyle: { color: borderColor.value } },
    axisLabel: {
      color: mutedColor.value,
      fontSize: 12,
      fontWeight: 600,
    },
  },
  yAxis: {
    type: 'value',
    min: 0,
    axisLine: { show: false },
    axisTick: { show: false },
    splitLine: {
      lineStyle: {
        color: borderColor.value,
        type: 'dashed',
      },
    },
    axisLabel: {
      color: mutedColor.value,
      fontSize: 11,
    },
  },
  series: [
    {
      type: 'bar',
      barWidth: DASHBOARD_CHART_BAR_WIDTH,
      data: [
        {
          value: Math.max(0, props.consumed),
          itemStyle: {
            color: primaryColor.value,
            borderRadius: [10, 10, 0, 0],
          },
        },
        {
          value: Math.max(0, props.target),
          itemStyle: {
            color: accentColor.value,
            borderRadius: [10, 10, 0, 0],
          },
        },
      ],
    },
  ],
}))
</script>
