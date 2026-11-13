<template>
  <section class="progress-summary" :aria-label="t('dashboard.progressPage.summaryAria')">
    <div class="progress-summary__top">
      <p class="progress-summary__average">
        <span class="progress-summary__label">{{ t('dashboard.progressPage.avgCalories') }}</span>
        <span class="progress-summary__value">
          {{ stats.average.calories }}
          <span class="progress-summary__unit">{{ t('dashboard.summary.kcal') }}</span>
        </span>
      </p>
      <p v-if="target != null" class="progress-summary__target">
        {{ t('dashboard.progressPage.targetShort', { value: target }) }}
      </p>
    </div>

    <div v-if="target != null" class="progress-summary__adherence">
      <p class="progress-summary__adherence-text">
        {{
          t('dashboard.progressPage.daysOnTargetValue', {
            count: stats.daysOnTarget,
            total: stats.loggedDays,
          })
        }}
      </p>
      <span class="progress-summary__dots" aria-hidden="true">
        <span
          v-for="day in days"
          :key="day.date"
          class="progress-summary__dot"
          :class="`progress-summary__dot--${day.status}`"
        />
      </span>
    </div>
    <p v-else class="progress-summary__adherence-text">{{ t('dashboard.summary.noTarget') }}</p>
  </section>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { ProgressDay, ProgressStats } from '@/utils/dashboard'
import '@/styles/components/progress-summary.css'

defineProps<{
  stats: ProgressStats
  days: ProgressDay[]
  target: number | null
}>()

const { t } = useI18n()
</script>
