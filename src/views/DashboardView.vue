<template>
  <AppPageShell wide>
    <template #title>
      {{ pageTitle }}
    </template>

    <AppLoader v-if="isLoading" />

    <p
      v-else-if="loadError"
      class="app-page__message app-page__message--error"
      role="alert"
    >
      {{ loadError }}
    </p>

    <template v-else>
      <DashboardDayStrip
        v-model="selectedDate"
        :aria-label="t('dashboard.dayStrip.aria')"
        :prev-label="t('dashboard.dayStrip.prevWeek')"
        :next-label="t('dashboard.dayStrip.nextWeek')"
      />

      <DashboardProgressCard
        :title="t('dashboard.progress.title')"
        :target-calories="summary.targetCalories"
        :consumed-calories="summary.consumed.calories"
        :protein="summary.consumed.protein"
        :fat="summary.consumed.fat"
        :carbs="summary.consumed.carbs"
        :target-protein="macroTargets.protein"
        :target-fat="macroTargets.fat"
        :target-carbs="macroTargets.carbs"
        :remaining-label="t('dashboard.summary.remaining')"
        :over-label="t('dashboard.summary.over')"
        :eaten-label="t('dashboard.summary.consumed')"
        :target-label="t('dashboard.summary.target')"
        :no-target-label="t('dashboard.summary.noTarget')"
        :unit-label="t('dashboard.summary.kcal')"
        :protein-label="t('dashboard.macros.protein')"
        :fat-label="t('dashboard.macros.fat')"
        :carbs-label="t('dashboard.macros.carbs')"
        :grams-label="formatMacroGrams"
        :of-target-label="formatMacroOfTarget"
        :ring-aria-label="t('dashboard.progress.ringAria')"
      />

      <section class="dashboard-page__section">
        <div class="dashboard-page__section-head">
          <h2 class="dashboard-page__section-title">
            {{ t('dashboard.meals.title') }}
          </h2>
          <button
            type="button"
            class="dashboard-page__section-action"
            @click="goToAddMeal()"
          >
            +
          </button>
        </div>

        <AppEmptyState
          v-if="summary.entryCount === 0"
          :title="t('dashboard.meals.emptyTitle')"
          :message="t('dashboard.meals.emptyMessage')"
        >
          <AppButton type="button" @click="goToAddMeal()">
            {{ t('dashboard.addFood') }}
          </AppButton>
        </AppEmptyState>

        <ul v-else class="dashboard-page__groups">
          <li
            v-for="group in visibleGroups"
            :key="group.mealType"
            class="dashboard-page__group"
          >
            <div class="dashboard-page__group-head">
              <h3 class="dashboard-page__group-title">
                {{ t(`meals.${group.mealType}`) }}
              </h3>
              <p class="dashboard-page__group-kcal">
                {{ formatNumber(group.totals.calories) }}
                {{ t('dashboard.summary.kcal') }}
              </p>
            </div>
            <ul class="dashboard-page__items">
              <li
                v-for="item in group.items"
                :key="item.entryId"
                class="dashboard-page__item"
              >
                <div class="dashboard-page__item-body">
                  <h4 class="dashboard-page__item-name">{{ item.name }}</h4>
                  <p class="dashboard-page__item-macros">
                    {{
                      t('dashboard.meals.macrosShort', {
                        protein: formatNumber(item.protein),
                        fat: formatNumber(item.fat),
                        carbs: formatNumber(item.carbs),
                      })
                    }}
                    <span v-if="item.servings !== 1">
                      ·
                      {{
                        t('dashboard.meals.servings', {
                          count: formatNumber(item.servings),
                        })
                      }}
                    </span>
                  </p>
                </div>
                <div class="dashboard-page__item-aside">
                  <p class="dashboard-page__item-kcal">
                    {{ formatNumber(item.calories) }}
                    {{ t('dashboard.summary.kcal') }}
                  </p>
                  <button
                    type="button"
                    class="dashboard-page__item-edit"
                    :aria-label="t('dashboard.meals.edit')"
                    @click="goToAddMeal(item.mealId)"
                  >
                    <span
                      class="dashboard-page__item-edit-icon"
                      aria-hidden="true"
                      v-html="iconEdit"
                    />
                  </button>
                </div>
              </li>
            </ul>
          </li>
        </ul>
      </section>
    </template>
  </AppPageShell>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import iconEdit from '@/assets/icons/edit.svg?raw'
import AppButton from '@/components/common/AppButton.vue'
import AppEmptyState from '@/components/common/AppEmptyState.vue'
import AppLoader from '@/components/common/AppLoader.vue'
import AppPageShell from '@/components/common/AppPageShell.vue'
import DashboardDayStrip from '@/components/dashboard/DashboardDayStrip.vue'
import DashboardProgressCard from '@/components/dashboard/DashboardProgressCard.vue'
import { useAppNavigation } from '@/composables/useAppNavigation'
import { useAuth } from '@/composables/useAuth'
import { useLocale } from '@/composables/useLocale'
import { MEAL_TYPES } from '@/constants/meals'
import { useDailyEntriesForDateQuery } from '@/queries/meals'
import { useProfileQuery } from '@/queries/profile'
import {
  buildDashboardDaySummary,
  formatLocalDateKey,
  parseLocalDateKey,
} from '@/utils/dashboard'
import { resolveMealErrorI18nKey } from '@/utils/mealErrors'
import { roundNutrition } from '@/utils/macros'
import { formatLocalDate } from '@/services/meals'
import '@/styles/views/dashboard.css'

const { t } = useI18n()
const { currentLocale } = useLocale()
const { goToAddMeal } = useAppNavigation()
const { user } = useAuth()
const userId = computed(() => user.value?.id)
const selectedDate = ref(formatLocalDate(new Date()))
const todayKey = formatLocalDateKey(new Date())

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

const visibleGroups = computed(() =>
  summary.value.groups.filter((group) => group.items.length > 0),
)

const macroTargets = computed(() => ({
  protein: profileQuery.data.value?.dailyProtein ?? null,
  fat: profileQuery.data.value?.dailyFat ?? null,
  carbs: profileQuery.data.value?.dailyCarbs ?? null,
}))

const pageTitle = computed(() => {
  if (selectedDate.value === todayKey) {
    return t('dashboard.title')
  }

  const date = parseLocalDateKey(selectedDate.value)

  return new Intl.DateTimeFormat(currentLocale.value, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(date)
})

function formatNumber(value: number): string {
  return String(roundNutrition(value))
}

function formatMacroGrams(value: number): string {
  return t('dashboard.macros.grams', { value: formatNumber(value) })
}

function formatMacroOfTarget(value: number, target: number): string {
  return t('dashboard.macros.ofTarget', {
    value: formatNumber(value),
    target: formatNumber(target),
  })
}
</script>
