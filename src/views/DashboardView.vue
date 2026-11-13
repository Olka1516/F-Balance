<template>
  <AppPageShell bare>
    <div class="dashboard-page">
      <DashboardHero
        :title="pageTitle"
        :target-calories="summary.targetCalories"
        :consumed-calories="summary.consumed.calories"
      />

      <div class="dashboard-page__content">
        <DashboardMacros
          :consumed="summary.consumed"
          :targets="macroTargets"
        />

        <DashboardDateNav v-model="selectedDate" />

        <AppLoader v-if="isLoading" />

        <p
          v-else-if="loadError"
          class="app-page__message app-page__message--error"
          role="alert"
        >
          {{ loadError }}
        </p>

        <section v-else class="dashboard-page__meals" :aria-label="t('dashboard.meals.title')">
          <ul class="dashboard-page__groups">
            <DashboardMealGroup
              v-for="group in summary.groups"
              :key="group.mealType"
              :group="group"
            />
          </ul>

          <NextMealCard
            v-if="isToday"
            :remaining-calories="summary.remaining"
            :today-meal-ids="todayMealIds"
            :day-key="selectedDate"
          />
        </section>
      </div>
    </div>
  </AppPageShell>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import AppLoader from '@/components/common/AppLoader.vue'
import AppPageShell from '@/components/common/AppPageShell.vue'
import DashboardDateNav from '@/components/dashboard/DashboardDateNav.vue'
import DashboardHero from '@/components/dashboard/DashboardHero.vue'
import DashboardMacros from '@/components/dashboard/DashboardMacros.vue'
import DashboardMealGroup from '@/components/dashboard/DashboardMealGroup.vue'
import NextMealCard from '@/components/dashboard/NextMealCard.vue'
import { useAuth } from '@/composables/useAuth'
import { useLocale } from '@/composables/useLocale'
import { MEAL_TYPES } from '@/constants/meals'
import { DASHBOARD_DATE_QUERY } from '@/constants/routes'
import { useDailyEntriesForDateQuery } from '@/queries/meals'
import { useProfileQuery } from '@/queries/profile'
import {
  buildDashboardDaySummary,
  formatLocalDateKey,
  parseLocalDateKey,
} from '@/utils/dashboard'
import { resolveMealErrorI18nKey } from '@/utils/mealErrors'
import '@/styles/views/dashboard.css'

const { t } = useI18n()
const { currentLocale } = useLocale()
const { user } = useAuth()
const userId = computed(() => user.value?.id)
const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/
const todayKey = formatLocalDateKey(new Date())
const route = useRoute()
const selectedDate = ref(resolveInitialDate())

const profileQuery = useProfileQuery(userId)
const entriesQuery = useDailyEntriesForDateQuery(userId, selectedDate)

const isLoading = computed(() => {
  const profileBooting =
    profileQuery.isPending.value && !profileQuery.isFetched.value
  const entriesBooting =
    entriesQuery.isPending.value &&
    !entriesQuery.isFetched.value &&
    !entriesQuery.isPlaceholderData.value

  return profileBooting || entriesBooting
})

const loadError = computed(() => {
  const error = profileQuery.error.value ?? entriesQuery.error.value

  if (!error) {
    return ''
  }

  const code = String(error.message)

  if (
    code === 'tableMissing' ||
    code === 'permissionDenied' ||
    code === 'notFound'
  ) {
    return t(resolveMealErrorI18nKey(code))
  }

  return t('dashboard.errors.load')
})

const summary = computed(() =>
  buildDashboardDaySummary(
    entriesQuery.data.value ?? [],
    MEAL_TYPES,
    profileQuery.data.value?.dailyCalories ?? null,
  ),
)

const isToday = computed(() => selectedDate.value === todayKey)

const todayMealIds = computed(
  () => new Set((entriesQuery.data.value ?? []).map((entry) => entry.mealId)),
)

const macroTargets = computed(() => ({
  protein: profileQuery.data.value?.dailyProtein ?? null,
  fat: profileQuery.data.value?.dailyFat ?? null,
  carbs: profileQuery.data.value?.dailyCarbs ?? null,
}))

function resolveInitialDate(): string {
  const value = route.query[DASHBOARD_DATE_QUERY]

  return typeof value === 'string' && DATE_KEY_PATTERN.test(value) && value <= todayKey
    ? value
    : todayKey
}

const pageTitle = computed(() => {
  if (isToday.value) {
    return t('dashboard.title')
  }

  return new Intl.DateTimeFormat(currentLocale.value, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(parseLocalDateKey(selectedDate.value))
})
</script>
