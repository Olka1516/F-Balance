<template>
  <div
    class="dashboard-week-chart"
    role="img"
    :aria-label="ariaLabel"
    :style="chartSizeStyle"
  >
    <VChart
      class="dashboard-week-chart__canvas"
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
import { BarChart, LineChart } from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
} from 'echarts/components'
import VChart from 'vue-echarts'
import {
  DASHBOARD_CHART_ANIMATION_MS,
  DASHBOARD_WEEK_CHART_HEIGHT_REM,
} from '@/constants/dashboard'
import type { DashboardWeekDayPoint } from '@/utils/dashboard'
import '@/styles/components/dashboard-week-chart.css'

use([
  CanvasRenderer,
  BarChart,
  LineChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
])

const props = defineProps<{
  points: DashboardWeekDayPoint[]
  labels: string[]
  target: number | null
  consumedLabel: string
  targetLabel: string
  unitLabel: string
  ariaLabel: string
}>()

const primaryColor = ref('#c45c26')
const accentColor = ref('#d4a017')
const mutedColor = ref('#7a6555')
const borderColor = ref('#e8d4b8')
const textColor = ref('#2e2218')

const chartSizeStyle = computed(() => ({
  height: `${DASHBOARD_WEEK_CHART_HEIGHT_REM}rem`,
  minHeight: `${DASHBOARD_WEEK_CHART_HEIGHT_REM}rem`,
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
  textColor.value =
    styles.getPropertyValue('--color-text').trim() || textColor.value
})

const option = computed(() => {
  const series: Record<string, unknown>[] = [
    {
      name: props.consumedLabel,
      type: 'bar',
      data: props.points.map((point) => point.calories),
      barWidth: '46%',
      itemStyle: {
        color: primaryColor.value,
        borderRadius: [6, 6, 0, 0],
      },
    },
  ]

  if (props.target != null) {
    series.push({
      name: props.targetLabel,
      type: 'line',
      data: props.points.map(() => props.target),
      symbol: 'none',
      lineStyle: {
        color: accentColor.value,
        width: 2,
        type: 'dashed',
      },
    })
  }

  return {
    animationDuration: DASHBOARD_CHART_ANIMATION_MS,
    grid: {
      left: 8,
      right: 8,
      top: 36,
      bottom: 8,
      containLabel: true,
    },
    legend: {
      top: 0,
      left: 'center',
      textStyle: {
        color: mutedColor.value,
        fontSize: 11,
      },
      itemWidth: 12,
      itemHeight: 8,
    },
    tooltip: {
      trigger: 'axis',
      valueFormatter: (value: number) => `${value} ${props.unitLabel}`,
    },
    xAxis: {
      type: 'category',
      data: props.labels,
      axisTick: { show: false },
      axisLine: { lineStyle: { color: borderColor.value } },
      axisLabel: {
        color: mutedColor.value,
        fontSize: 11,
      },
    },
    yAxis: {
      type: 'value',
      min: 0,
      axisLabel: {
        color: mutedColor.value,
        fontSize: 11,
      },
      splitLine: {
        lineStyle: {
          color: borderColor.value,
          type: 'dashed',
        },
      },
    },
    series,
  }
})
</script>
