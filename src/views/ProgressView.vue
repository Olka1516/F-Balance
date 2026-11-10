<template>
  <AppPageShell wide>
    <template #title>
      {{ t('dashboard.progressPage.title') }}
    </template>
    <template #intro>
      {{ t('dashboard.progressPage.intro') }}
    </template>

    <AppLoader v-if="isLoading" />

    <p
      v-else-if="loadError"
      class="app-page__message app-page__message--error"
      role="alert"
    >
      {{ t('dashboard.errors.load') }}
    </p>

    <AppEmptyState
      v-else-if="stats.loggedDays === 0"
      :title="t('dashboard.progressPage.emptyTitle')"
      :message="t('dashboard.progressPage.emptyMessage')"
    >
      <AppButton type="button" @click="goToAddMeal()">
        {{ t('dashboard.addFood') }}
      </AppButton>
    </AppEmptyState>

    <template v-else>
      <ul class="progress-page__stats">
        <li class="progress-page__stat">
          <p class="progress-page__stat-label">
            {{ t('dashboard.progressPage.avgCalories') }}
          </p>
          <p class="progress-page__stat-value">
            {{ stats.average.calories }}
            <span class="progress-page__stat-unit">{{ t('dashboard.summary.kcal') }}</span>
          </p>
        </li>
        <li v-if="targetCalories" class="progress-page__stat">
          <p class="progress-page__stat-label">
            {{ t('dashboard.progressPage.daysOnTarget') }}
          </p>
          <p class="progress-page__stat-value">
            {{
              t('dashboard.progressPage.daysOnTargetValue', {
                count: stats.daysOnTarget,
                total: stats.loggedDays,
              })
            }}
          </p>
        </li>
        <li class="progress-page__stat">
          <p class="progress-page__stat-label">
            {{ t('dashboard.progressPage.loggedDays') }}
          </p>
          <p class="progress-page__stat-value">
            {{
              t('dashboard.progressPage.daysOnTargetValue', {
                count: stats.loggedDays,
                total: stats.totalDays,
              })
            }}
          </p>
        </li>
        <li class="progress-page__stat">
          <p class="progress-page__stat-label">
            {{ t('dashboard.progressPage.avgMacros') }}
          </p>
          <p class="progress-page__stat-macros">
            {{
              t('dashboard.meals.macrosShort', {
                protein: stats.average.protein,
                fat: stats.average.fat,
                carbs: stats.average.carbs,
              })
            }}
          </p>
        </li>
      </ul>

      <section class="progress-page__chart">
        <h2 class="progress-page__chart-title">{{ t('dashboard.chart.tabs.week') }}</h2>
        <DashboardWeekChart
          :points="points"
          :labels="labels"
          :target="targetCalories"
          :consumed-label="t('dashboard.chart.consumed')"
          :target-label="t('dashboard.chart.target')"
          :unit-label="t('dashboard.summary.kcal')"
          :chart-aria-label="t('dashboard.chart.weekAria')"
        />
      </section>
    </template>
  </AppPageShell>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import AppButton from '@/components/common/AppButton.vue'
import AppEmptyState from '@/components/common/AppEmptyState.vue'
import AppLoader from '@/components/common/AppLoader.vue'
import AppPageShell from '@/components/common/AppPageShell.vue'
import DashboardWeekChart from '@/components/dashboard/DashboardWeekChart.vue'
import { useAppNavigation } from '@/composables/useAppNavigation'
import { useAuth } from '@/composables/useAuth'
import { useLocale } from '@/composables/useLocale'
import { DASHBOARD_WEEK_DAYS, PROGRESS_TARGET_TOLERANCE } from '@/constants/dashboard'
import { useWeekDailyEntriesQuery } from '@/queries/meals'
import { useProfileQuery } from '@/queries/profile'
import {
  buildProgressStats,
  buildWeekCaloriePoints,
  listRecentLocalDates,
  parseLocalDateKey,
} from '@/utils/dashboard'
import '@/styles/views/progress.css'

const { t } = useI18n()
const { currentLocale } = useLocale()
const { goToAddMeal } = useAppNavigation()
const { user } = useAuth()
const userId = computed(() => user.value?.id)

const profileQuery = useProfileQuery(userId)
const weekQuery = useWeekDailyEntriesQuery(userId, DASHBOARD_WEEK_DAYS)

const dates = computed(() => listRecentLocalDates(DASHBOARD_WEEK_DAYS))
const targetCalories = computed(() => profileQuery.data.value?.dailyCalories ?? null)

const isLoading = computed(
  () =>
    (profileQuery.isPending.value && !profileQuery.isFetched.value) ||
    (weekQuery.isPending.value && !weekQuery.isFetched.value),
)

const loadError = computed(() => Boolean(profileQuery.error.value ?? weekQuery.error.value))

const stats = computed(() =>
  buildProgressStats(
    weekQuery.data.value ?? [],
    dates.value,
    targetCalories.value,
    PROGRESS_TARGET_TOLERANCE,
  ),
)

const points = computed(() => buildWeekCaloriePoints(weekQuery.data.value ?? [], dates.value))

const labels = computed(() => {
  const format = new Intl.DateTimeFormat(currentLocale.value, { weekday: 'short' })
  return dates.value.map((date) => format.format(parseLocalDateKey(date)))
})
</script>
