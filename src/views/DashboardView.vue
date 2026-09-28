<template>
  <AppPageShell wide>
    <template #title>
      {{ t('dashboard.title') }}
    </template>
    <template #intro>
      {{ t('dashboard.subtitle') }}
    </template>
    <template #actions>
      <AppButton type="button" @click="goToAddMeal()">
        {{ t('dashboard.addFood') }}
      </AppButton>
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
      <section class="dashboard-page__stats" :aria-label="t('dashboard.title')">
        <div class="dashboard-page__stat">
          <p class="dashboard-page__stat-label">
            {{ t('dashboard.summary.target') }}
          </p>
          <p class="dashboard-page__stat-value">
            {{ targetDisplay }}
          </p>
          <p class="dashboard-page__stat-unit">
            {{ t('dashboard.summary.kcal') }}
          </p>
        </div>
        <div class="dashboard-page__stat">
          <p class="dashboard-page__stat-label">
            {{ t('dashboard.summary.consumed') }}
          </p>
          <p class="dashboard-page__stat-value">
            {{ formatNumber(summary.consumed.calories) }}
          </p>
          <p class="dashboard-page__stat-unit">
            {{ t('dashboard.summary.kcal') }}
          </p>
        </div>
        <div
          class="dashboard-page__stat"
          :class="{ 'dashboard-page__stat--over': isOverTarget }"
        >
          <p class="dashboard-page__stat-label">
            {{
              isOverTarget
                ? t('dashboard.summary.over')
                : t('dashboard.summary.remaining')
            }}
          </p>
          <p class="dashboard-page__stat-value">
            {{ remainingDisplay }}
          </p>
          <p class="dashboard-page__stat-unit">
            {{ t('dashboard.summary.kcal') }}
          </p>
        </div>
      </section>

      <p v-if="summary.targetCalories == null" class="dashboard-page__hint">
        {{ t('dashboard.summary.noTarget') }}
      </p>

      <section class="dashboard-page__section">
        <h2 class="dashboard-page__section-title">
          {{ t('dashboard.macros.title') }}
        </h2>
        <div class="dashboard-page__macros">
          <div
            class="dashboard-page__macro"
            :class="{ 'dashboard-page__macro--over': isMacroOver(summary.consumed.protein, macroTargets.protein) }"
          >
            <p class="dashboard-page__macro-label">
              {{ t('dashboard.macros.protein') }}
            </p>
            <p class="dashboard-page__macro-value">
              {{ formatMacroValue(summary.consumed.protein, macroTargets.protein) }}
            </p>
          </div>
          <div
            class="dashboard-page__macro"
            :class="{ 'dashboard-page__macro--over': isMacroOver(summary.consumed.fat, macroTargets.fat) }"
          >
            <p class="dashboard-page__macro-label">
              {{ t('dashboard.macros.fat') }}
            </p>
            <p class="dashboard-page__macro-value">
              {{ formatMacroValue(summary.consumed.fat, macroTargets.fat) }}
            </p>
          </div>
          <div
            class="dashboard-page__macro"
            :class="{ 'dashboard-page__macro--over': isMacroOver(summary.consumed.carbs, macroTargets.carbs) }"
          >
            <p class="dashboard-page__macro-label">
              {{ t('dashboard.macros.carbs') }}
            </p>
            <p class="dashboard-page__macro-value">
              {{ formatMacroValue(summary.consumed.carbs, macroTargets.carbs) }}
            </p>
          </div>
        </div>
        <p v-if="!hasMacroTargets" class="dashboard-page__hint">
          {{ t('dashboard.macros.noTarget') }}
        </p>
      </section>

      <section class="dashboard-page__section">
        <h2 class="dashboard-page__section-title">
          {{ t('dashboard.chart.title') }}
        </h2>

        <div class="dashboard-page__chart-tabs" role="tablist">
          <button
            v-for="tab in DASHBOARD_CHART_TABS"
            :key="tab"
            type="button"
            role="tab"
            class="dashboard-page__chart-tab"
            :class="{ 'dashboard-page__chart-tab--active': chartTab === tab }"
            :aria-selected="chartTab === tab"
            @click="chartTab = tab"
          >
            {{ t(`dashboard.chart.tabs.${tab}`) }}
          </button>
        </div>

        <template v-if="chartTab === 'calories'">
          <DashboardProgressChart
            v-if="summary.targetCalories != null"
            :target="summary.targetCalories"
            :consumed="summary.consumed.calories"
            :target-label="t('dashboard.chart.target')"
            :consumed-label="t('dashboard.chart.consumed')"
            :unit-label="t('dashboard.summary.kcal')"
            :ariaLabel="t('dashboard.chart.aria')"
          />
          <p v-else class="dashboard-page__hint">
            {{ t('dashboard.summary.noTarget') }}
          </p>
        </template>

        <DashboardMacrosChart
          v-else
          :protein="summary.consumed.protein"
          :fat="summary.consumed.fat"
          :carbs="summary.consumed.carbs"
          :target-protein="macroTargets.protein"
          :target-fat="macroTargets.fat"
          :target-carbs="macroTargets.carbs"
          :protein-label="t('dashboard.macros.protein')"
          :fat-label="t('dashboard.macros.fat')"
          :carbs-label="t('dashboard.macros.carbs')"
          :grams-label="formatMacroGrams"
          :of-target-label="formatMacroOfTarget"
          :kcal-label="t('dashboard.summary.kcal')"
          :empty-label="t('dashboard.chart.macrosEmpty')"
          :within-label="t('dashboard.chart.macrosWithin')"
          :over-label="t('dashboard.chart.macrosOver')"
          :no-target-label="t('dashboard.chart.macrosNoTarget')"
          :ariaLabel="t('dashboard.chart.macrosAria')"
        />
      </section>

      <section class="dashboard-page__section">
        <h2 class="dashboard-page__section-title">
          {{ t('dashboard.meals.title') }}
        </h2>

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
            v-for="group in summary.groups"
            :key="group.mealType"
            class="dashboard-page__group"
            :class="{
              'dashboard-page__group--empty': group.items.length === 0,
            }"
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
            <ul v-if="group.items.length > 0" class="dashboard-page__items">
              <li
                v-for="item in group.items"
                :key="item.entryId"
                class="dashboard-page__item"
              >
                <div class="dashboard-page__item-top">
                  <h4 class="dashboard-page__item-name">{{ item.name }}</h4>
                  <p
                    v-if="item.servings !== 1"
                    class="dashboard-page__item-servings"
                  >
                    {{
                      t('dashboard.meals.servings', {
                        count: formatNumber(item.servings),
                      })
                    }}
                  </p>
                </div>
                <p class="dashboard-page__item-macros">
                  {{
                    t('dashboard.meals.macros', {
                      calories: formatNumber(item.calories),
                      protein: formatNumber(item.protein),
                      fat: formatNumber(item.fat),
                      carbs: formatNumber(item.carbs),
                    })
                  }}
                </p>
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
import AppButton from '@/components/common/AppButton.vue'
import AppEmptyState from '@/components/common/AppEmptyState.vue'
import AppLoader from '@/components/common/AppLoader.vue'
import AppPageShell from '@/components/common/AppPageShell.vue'
import DashboardMacrosChart from '@/components/dashboard/DashboardMacrosChart.vue'
import DashboardProgressChart from '@/components/dashboard/DashboardProgressChart.vue'
import { useAppNavigation } from '@/composables/useAppNavigation'
import { useAuth } from '@/composables/useAuth'
import {
  DASHBOARD_CHART_TAB_DEFAULT,
  DASHBOARD_CHART_TABS,
  type DashboardChartTab,
} from '@/constants/dashboard'
import { MEAL_TYPES } from '@/constants/meals'
import { useTodayDailyEntriesQuery } from '@/queries/meals'
import { useProfileQuery } from '@/queries/profile'
import { buildDashboardDaySummary } from '@/utils/dashboard'
import { resolveMealErrorI18nKey } from '@/utils/mealErrors'
import { roundNutrition } from '@/utils/macros'
import '@/styles/views/dashboard.css'

const { t } = useI18n()
const { goToAddMeal } = useAppNavigation()
const { user } = useAuth()
const userId = computed(() => user.value?.id)
const chartTab = ref<DashboardChartTab>(DASHBOARD_CHART_TAB_DEFAULT)

const profileQuery = useProfileQuery(userId)
const entriesQuery = useTodayDailyEntriesQuery(userId)

const isLoading = computed(
  () =>
    (profileQuery.isPending.value && !profileQuery.isFetched.value) ||
    (entriesQuery.isPending.value && !entriesQuery.isFetched.value),
)

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

const macroTargets = computed(() => ({
  protein: profileQuery.data.value?.dailyProtein ?? null,
  fat: profileQuery.data.value?.dailyFat ?? null,
  carbs: profileQuery.data.value?.dailyCarbs ?? null,
}))

const hasMacroTargets = computed(
  () =>
    macroTargets.value.protein != null ||
    macroTargets.value.fat != null ||
    macroTargets.value.carbs != null,
)

const isOverTarget = computed(
  () => summary.value.remaining != null && summary.value.remaining < 0,
)

const targetDisplay = computed(() => {
  if (summary.value.targetCalories == null) {
    return '—'
  }

  return formatNumber(summary.value.targetCalories)
})

const remainingDisplay = computed(() => {
  if (summary.value.remaining == null) {
    return '—'
  }

  return formatNumber(Math.abs(summary.value.remaining))
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

function formatMacroValue(value: number, target: number | null): string {
  if (target == null) {
    return formatMacroGrams(value)
  }

  return formatMacroOfTarget(value, target)
}

function isMacroOver(value: number, target: number | null): boolean {
  return target != null && value > target
}
</script>
