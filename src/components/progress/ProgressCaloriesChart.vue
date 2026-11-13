<template>
  <section class="progress-chart" :aria-labelledby="titleId">
    <h2 :id="titleId" class="progress-chart__title">{{ t('dashboard.progressPage.chartTitle') }}</h2>

    <div class="progress-chart__canvas" role="img" :aria-label="t('dashboard.progressPage.chartAria')" :style="sizeStyle">
      <VChart :option="option" autoresize :style="sizeStyle" @click="onChartClick" />
    </div>

    <p v-if="target != null" class="progress-chart__legend">
      {{ t('dashboard.progressPage.targetLine', { value: target }) }}
    </p>

    <div v-if="selectedDay" class="progress-chart__day">
      <div class="progress-chart__day-text">
        <p class="progress-chart__day-title">{{ selectedTitle }}</p>
        <p class="progress-chart__day-meta">{{ selectedMeta }}</p>
      </div>
      <AppButton type="button" @click="emit('open', selectedDay.date)">
        {{ t('dashboard.progressPage.openDay') }}
      </AppButton>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, useId } from 'vue'
import { useI18n } from 'vue-i18n'
import { BarChart, LineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent } from 'echarts/components'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import VChart from 'vue-echarts'
import AppButton from '@/components/common/AppButton.vue'
import { useLocale } from '@/composables/useLocale'
import { useThemeColors } from '@/composables/useThemeColors'
import {
  PROGRESS_CHART_ANIMATION_MS,
  PROGRESS_CHART_HEIGHT_REM,
  type ProgressPeriod,
} from '@/constants/dashboard'
import { parseLocalDateKey, type ProgressDay } from '@/utils/dashboard'
import '@/styles/components/progress-chart.css'

use([CanvasRenderer, BarChart, LineChart, GridComponent, TooltipComponent])

const props = defineProps<{
  days: ProgressDay[]
  period: ProgressPeriod
  target: number | null
}>()

const emit = defineEmits<{
  open: [date: string]
}>()

const selectedDate = defineModel<string | null>('selected', { required: true })

const { t } = useI18n()
const { currentLocale } = useLocale()
const titleId = useId()
const BAR_RADIUS = 6
const sizeStyle = { height: `${PROGRESS_CHART_HEIGHT_REM}rem` }

const colors = useThemeColors({
  selected: '--color-primary',
  onTarget: '--color-chart-on-target',
  off: '--color-chart-off-target',
  empty: '--color-chart-empty',
  muted: '--color-text-muted',
  border: '--color-border',
})

const labels = computed(() => {
  const format = new Intl.DateTimeFormat(
    currentLocale.value,
    props.period === 'week' ? { weekday: 'short' } : { day: 'numeric' },
  )

  return props.days.map((day) => format.format(parseLocalDateKey(day.date)))
})

const selectedDay = computed(() => props.days.find((day) => day.date === selectedDate.value) ?? null)

const selectedTitle = computed(() => {
  const day = selectedDay.value

  if (!day) {
    return ''
  }

  const label = new Intl.DateTimeFormat(currentLocale.value, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(parseLocalDateKey(day.date))

  return day.status === 'empty'
    ? label
    : `${label} · ${Math.round(day.totals.calories)} ${t('dashboard.summary.kcal')}`
})

const selectedMeta = computed(() => {
  const day = selectedDay.value

  if (!day || day.status === 'empty') {
    return t('dashboard.progressPage.dayEmpty')
  }

  if (props.target == null) {
    return ''
  }

  const diff = Math.round(day.totals.calories - props.target)

  if (day.status === 'onTarget') {
    return t('dashboard.progressPage.dayOnTarget')
  }

  return diff > 0
    ? t('dashboard.progressPage.dayOver', { value: diff })
    : t('dashboard.progressPage.dayUnder', { value: Math.abs(diff) })
})

const option = computed(() => ({
  animationDuration: PROGRESS_CHART_ANIMATION_MS,
  grid: { left: 4, right: 4, top: 8, bottom: 4, containLabel: true },
  tooltip: {
    trigger: 'axis',
    valueFormatter: (value: number) => `${value} ${t('dashboard.summary.kcal')}`,
  },
  xAxis: {
    type: 'category',
    data: labels.value,
    axisTick: { show: false },
    axisLine: { show: false },
    axisLabel: { color: colors.muted, fontSize: 11 },
  },
  yAxis: { type: 'value', min: 0, show: false },
  series: [
    {
      type: 'bar',
      barWidth: props.period === 'week' ? '62%' : '70%',
      data: props.days.map((day) => ({
        value: Math.round(day.totals.calories),
        itemStyle: {
          borderRadius: BAR_RADIUS,
          color: day.date === selectedDate.value && day.status !== 'empty' ? colors.selected : colors[day.status],
        },
      })),
      markLine:
        props.target == null
          ? undefined
          : {
              symbol: 'none',
              silent: true,
              label: { show: false },
              lineStyle: { color: colors.muted, type: 'dashed', width: 1.5 },
              data: [{ yAxis: props.target }],
            },
    },
  ],
}))

function onChartClick(params: { dataIndex?: number }): void {
  const day = params.dataIndex == null ? undefined : props.days[params.dataIndex]

  if (day) {
    selectedDate.value = day.date
  }
}
</script>
