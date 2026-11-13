<template>
  <AppPageShell bare>
    <div class="progress-page">
      <header class="progress-page__header">
        <h1 class="progress-page__title">{{ t('dashboard.progressPage.title') }}</h1>
        <div class="progress-page__periods" role="group" :aria-label="t('dashboard.progressPage.periodAria')">
          <button
            v-for="item in PROGRESS_PERIODS"
            :key="item"
            type="button"
            class="progress-page__period"
            :class="{ 'progress-page__period--active': period === item }"
            :aria-pressed="period === item"
            @click="selectPeriod(item)"
          >
            {{ t(`dashboard.progressPage.periods.${item}`) }}
          </button>
        </div>
      </header>

      <nav class="progress-page__range" :aria-label="t('dashboard.progressPage.rangeAria')">
        <button
          type="button"
          class="progress-page__arrow"
          :aria-label="t('dashboard.progressPage.prev')"
          @click="offset -= 1"
        >
          <span class="progress-page__icon" aria-hidden="true" v-html="iconChevronLeft" />
        </button>
        <span class="progress-page__range-label">{{ rangeLabel }}</span>
        <button
          type="button"
          class="progress-page__arrow"
          :aria-label="t('dashboard.progressPage.next')"
          :disabled="offset >= 0"
          @click="offset += 1"
        >
          <span class="progress-page__icon" aria-hidden="true" v-html="iconChevronRight" />
        </button>
      </nav>

      <AppLoader v-if="isLoading" />

      <p v-else-if="loadError" class="app-page__message app-page__message--error" role="alert">
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
        <ProgressSummary :stats="stats" :days="days" :target="targetCalories" />

        <ProgressCaloriesChart
          v-model:selected="selectedDate"
          :days="days"
          :period="period"
          :target="targetCalories"
          @open="openDay"
        />

        <section class="progress-page__macros" :aria-labelledby="macrosTitleId">
          <h2 :id="macrosTitleId" class="progress-page__section-title">
            {{ t('dashboard.progressPage.avgMacros') }}
          </h2>
          <DashboardMacros :consumed="stats.average" :targets="macroTargets" />
        </section>
      </template>

      <ProgressWeightCard
        v-if="!isLoading && !loadError"
        :weight="profile?.weight ?? null"
        :target-weight="profile?.targetWeight ?? null"
        @update="goToProfile"
      />
    </div>
  </AppPageShell>
</template>

<script setup lang="ts">
import { computed, ref, useId, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import iconChevronLeft from '@/assets/icons/chevron-left.svg?raw'
import iconChevronRight from '@/assets/icons/chevron-right.svg?raw'
import AppButton from '@/components/common/AppButton.vue'
import AppEmptyState from '@/components/common/AppEmptyState.vue'
import AppLoader from '@/components/common/AppLoader.vue'
import AppPageShell from '@/components/common/AppPageShell.vue'
import DashboardMacros from '@/components/dashboard/DashboardMacros.vue'
import ProgressCaloriesChart from '@/components/progress/ProgressCaloriesChart.vue'
import ProgressSummary from '@/components/progress/ProgressSummary.vue'
import ProgressWeightCard from '@/components/progress/ProgressWeightCard.vue'
import { useAppNavigation } from '@/composables/useAppNavigation'
import { useAuth } from '@/composables/useAuth'
import { useLocale } from '@/composables/useLocale'
import {
  PROGRESS_PERIODS,
  PROGRESS_TARGET_TOLERANCE,
  type ProgressPeriod,
} from '@/constants/dashboard'
import { DASHBOARD_DATE_QUERY, ROUTE_NAMES } from '@/constants/routes'
import { useDailyEntriesRangeQuery } from '@/queries/meals'
import { useProfileQuery } from '@/queries/profile'
import {
  buildProgressDays,
  buildProgressStats,
  formatLocalDateKey,
  listPeriodLocalDates,
  parseLocalDateKey,
} from '@/utils/dashboard'
import '@/styles/views/progress.css'

const { t } = useI18n()
const router = useRouter()
const { currentLocale } = useLocale()
const { goToAddMeal, goToProfile } = useAppNavigation()
const { user } = useAuth()
const userId = computed(() => user.value?.id)
const macrosTitleId = useId()
const todayKey = formatLocalDateKey(new Date())

const period = ref<ProgressPeriod>('week')
const offset = ref(0)
const selectedDate = ref<string | null>(null)

const dates = computed(() => listPeriodLocalDates(period.value, offset.value))
const profileQuery = useProfileQuery(userId)
const entriesQuery = useDailyEntriesRangeQuery(userId, dates)

const profile = computed(() => profileQuery.data.value ?? null)
const targetCalories = computed(() => profile.value?.dailyCalories ?? null)

const isLoading = computed(
  () =>
    (profileQuery.isPending.value && !profileQuery.isFetched.value) ||
    (entriesQuery.isPending.value && !entriesQuery.isFetched.value),
)

const loadError = computed(() => Boolean(profileQuery.error.value ?? entriesQuery.error.value))

const days = computed(() =>
  buildProgressDays(entriesQuery.data.value ?? [], dates.value, targetCalories.value, PROGRESS_TARGET_TOLERANCE),
)

const stats = computed(() => buildProgressStats(days.value))

const macroTargets = computed(() => ({
  protein: profile.value?.dailyProtein ?? null,
  fat: profile.value?.dailyFat ?? null,
  carbs: profile.value?.dailyCarbs ?? null,
}))

const rangeLabel = computed(() => {
  const first = parseLocalDateKey(dates.value[0] ?? todayKey)
  const last = parseLocalDateKey(dates.value[dates.value.length - 1] ?? todayKey)

  if (period.value === 'month') {
    return new Intl.DateTimeFormat(currentLocale.value, { month: 'long', year: 'numeric' }).format(first)
  }

  const full = new Intl.DateTimeFormat(currentLocale.value, { day: 'numeric', month: 'long' })
  const startLabel =
    first.getMonth() === last.getMonth()
      ? new Intl.DateTimeFormat(currentLocale.value, { day: 'numeric' }).format(first)
      : full.format(first)

  return `${startLabel} – ${full.format(last)}`
})

watch(
  days,
  (list) => {
    if (list.some((day) => day.date === selectedDate.value)) {
      return
    }

    const today = list.find((day) => day.date === todayKey && day.status !== 'empty')
    const lastLogged = [...list].reverse().find((day) => day.status !== 'empty')
    selectedDate.value = (today ?? lastLogged)?.date ?? null
  },
  { immediate: true },
)

function selectPeriod(next: ProgressPeriod): void {
  period.value = next
  offset.value = 0
}

function openDay(date: string): void {
  router.push({ name: ROUTE_NAMES.dashboard, query: { [DASHBOARD_DATE_QUERY]: date } })
}
</script>
