<template>
  <li class="dashboard-meal-group">
    <div class="dashboard-meal-group__head">
      <span
        class="dashboard-meal-group__badge"
        :class="`dashboard-meal-group__badge--${group.mealType}`"
        aria-hidden="true"
      >
        {{ mealLabel.charAt(0) }}
      </span>
      <div class="dashboard-meal-group__heading">
        <h3 class="dashboard-meal-group__title">{{ mealLabel }}</h3>
        <p class="dashboard-meal-group__meta">
          {{
            group.items.length
              ? `${formatNumber(group.totals.calories)} ${t('dashboard.summary.kcal')}`
              : t('dashboard.meals.empty')
          }}
        </p>
      </div>
      <button
        type="button"
        class="dashboard-meal-group__add"
        :aria-label="t('meals.saved.addTo', { meal: mealLabel })"
        @click="goToAddMeal(undefined, group.mealType)"
      >
        <span class="dashboard-meal-group__icon" aria-hidden="true" v-html="iconPlus" />
      </button>
    </div>

    <ul v-if="group.items.length" class="dashboard-meal-group__items">
      <li v-for="item in group.items" :key="item.entryId" class="dashboard-meal-group__item">
        <div class="dashboard-meal-group__item-body">
          <p class="dashboard-meal-group__item-name">{{ item.name }}</p>
          <p class="dashboard-meal-group__item-macros">
            {{
              t('dashboard.meals.macrosShort', {
                protein: formatNumber(item.protein),
                fat: formatNumber(item.fat),
                carbs: formatNumber(item.carbs),
              })
            }}
            <span v-if="item.servings !== 1">
              · {{ t('dashboard.meals.servings', { count: formatNumber(item.servings) }) }}
            </span>
          </p>
        </div>
        <p class="dashboard-meal-group__item-kcal">
          {{ formatNumber(item.calories) }} {{ t('dashboard.summary.kcal') }}
        </p>
        <button
          type="button"
          class="dashboard-meal-group__edit"
          :aria-label="t('dashboard.meals.edit')"
          @click="goToAddMeal(item.mealId)"
        >
          <span class="dashboard-meal-group__icon" aria-hidden="true" v-html="iconEdit" />
        </button>
      </li>
    </ul>
  </li>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import iconEdit from '@/assets/icons/edit.svg?raw'
import iconPlus from '@/assets/icons/plus.svg?raw'
import { useAppNavigation } from '@/composables/useAppNavigation'
import type { DashboardMealGroup } from '@/utils/dashboard'
import '@/styles/components/dashboard-meal-group.css'

const props = defineProps<{
  group: DashboardMealGroup
}>()

const { t } = useI18n()
const { goToAddMeal } = useAppNavigation()

const mealLabel = computed(() => t(`meals.${props.group.mealType}`))

function formatNumber(value: number): string {
  return String(Math.round(value))
}
</script>
