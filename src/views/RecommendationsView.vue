<template>
  <AppPageShell wide>
    <template #title>
      {{ t('recommendations.title') }}
    </template>
    <template #intro>
      {{ t('recommendations.subtitle') }}
    </template>

    <div class="recommendations-page__context">
      <p>
        {{
          profileQuery.data.value?.goal
            ? t('recommendations.context.goal', {
                goal: t(`common.profile.goals.${profileQuery.data.value.goal}`),
              })
            : t('recommendations.context.goalNone')
        }}
      </p>
      <p>
        {{
          remainingCalories != null
            ? t('recommendations.context.remaining', {
                value: formatNumber(Math.max(0, remainingCalories)),
              })
            : t('recommendations.context.remainingNone')
        }}
      </p>
    </div>

    <p v-if="showLowRemainingHint" class="recommendations-page__hint" role="status">
      {{ t('recommendations.context.lowRemaining') }}
    </p>

    <div
      class="recommendations-page__tabs"
      role="tablist"
      :aria-label="t('recommendations.mealTypes.label')"
    >
      <button
        v-for="mealType in MEAL_TYPES"
        :key="mealType"
        type="button"
        role="tab"
        class="recommendations-page__tab"
        :class="{ 'recommendations-page__tab--active': selectedMealType === mealType }"
        :aria-selected="selectedMealType === mealType"
        @click="selectedMealType = mealType"
      >
        {{ t(`recommendations.mealTypes.${mealType}`) }}
      </button>
    </div>

    <AppLoader v-if="isLoading" />

    <p
      v-else-if="loadError"
      class="app-page__message app-page__message--error"
      role="alert"
    >
      {{ loadError }}
    </p>

    <AppEmptyState
      v-else-if="recommendations.length === 0"
      :title="t('recommendations.empty.title')"
      :message="t('recommendations.empty.message')"
    />

    <ul v-else class="recommendations-page__list">
      <li v-for="item in recommendations" :key="item.recipe.id">
        <RecommendationCard :item="item" />
      </li>
    </ul>

    <p class="recommendations-page__disclaimer">
      {{ t('recommendations.disclaimer') }}
    </p>
  </AppPageShell>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import AppEmptyState from '@/components/common/AppEmptyState.vue'
import AppLoader from '@/components/common/AppLoader.vue'
import AppPageShell from '@/components/common/AppPageShell.vue'
import RecommendationCard from '@/components/recommendations/RecommendationCard.vue'
import { useAuth } from '@/composables/useAuth'
import { MEAL_TYPES, type MealType } from '@/constants/meals'
import { useTodayDailyEntriesQuery } from '@/queries/meals'
import { useProfileQuery } from '@/queries/profile'
import { useRecommendationsQuery } from '@/queries/recommendations'
import { buildDashboardDaySummary } from '@/utils/dashboard'
import { formatLocalDate } from '@/services/meals'
import { roundNutrition } from '@/utils/macros'
import {
  isLowRemainingCalories,
  resolveMealTypeFromHour,
} from '@/utils/recommendations'
import '@/styles/views/recommendations.css'

const { t } = useI18n()
const { user } = useAuth()
const userId = computed(() => user.value?.id)

const selectedMealType = ref<MealType>(
  resolveMealTypeFromHour(new Date().getHours()),
)
const dayKey = formatLocalDate(new Date())

const profileQuery = useProfileQuery(userId)
const entriesQuery = useTodayDailyEntriesQuery(userId)

const remainingCalories = computed(() => {
  const summary = buildDashboardDaySummary(
    entriesQuery.data.value ?? [],
    MEAL_TYPES,
    profileQuery.data.value?.dailyCalories ?? null,
  )

  return summary.remaining
})

const goal = computed(() => profileQuery.data.value?.goal ?? null)

const recommendationsQuery = useRecommendationsQuery(
  selectedMealType,
  goal,
  remainingCalories,
  dayKey,
  computed(
    () =>
      Boolean(userId.value) &&
      profileQuery.isFetched.value &&
      entriesQuery.isFetched.value,
  ),
)

const isLoading = computed(
  () =>
    (profileQuery.isPending.value && !profileQuery.isFetched.value) ||
    (entriesQuery.isPending.value && !entriesQuery.isFetched.value) ||
    (recommendationsQuery.isPending.value &&
      !recommendationsQuery.isFetched.value),
)

const recommendations = computed(
  () => recommendationsQuery.data.value ?? [],
)

const showLowRemainingHint = computed(() =>
  isLowRemainingCalories(remainingCalories.value),
)

const loadError = computed(() => {
  const error = recommendationsQuery.error.value

  if (!error) {
    return ''
  }

  const code = String(error.message)

  if (code === 'rateLimited') {
    return t('recommendations.errors.rateLimited')
  }

  if (code === 'unavailable') {
    return t('recommendations.errors.unavailable')
  }

  return t('recommendations.errors.unknown')
})

function formatNumber(value: number): string {
  return String(roundNutrition(value))
}
</script>
