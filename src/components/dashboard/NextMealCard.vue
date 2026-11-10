<template>
  <details v-if="suggestions.length" class="next-meal-card">
    <summary class="next-meal-card__title">
      {{ t('dashboard.nextMeal.title', { meal: t(`meals.${mealType}`) }) }}
      <span class="next-meal-card__count">{{ suggestions.length }}</span>
    </summary>
    <ul class="next-meal-card__list">
      <li v-for="meal in suggestions" :key="meal.id" class="next-meal-card__item">
        <div class="next-meal-card__body">
          <p class="next-meal-card__name">{{ meal.name }}</p>
          <p class="next-meal-card__meta">
            {{ t('meals.saved.meta', { calories: Math.round(meal.calories), weight: Math.round(meal.totalWeight) }) }}
          </p>
        </div>
        <button
          type="button"
          class="next-meal-card__add"
          :aria-label="t('meals.saved.addTo', { meal: t(`meals.${mealType}`) })"
          :disabled="busyId !== null"
          @click="onAdd(meal.id)"
        >
          <span aria-hidden="true" v-html="iconPlus" />
        </button>
      </li>
    </ul>
  </details>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuth } from '@/composables/useAuth'
import {
  NEXT_MEAL_REMAINING_HEADROOM,
  NEXT_MEAL_SUGGESTION_COUNT,
} from '@/constants/meals'
import { useAddMealToTodayMutation, useMealsQuery } from '@/queries/meals'
import { resolveMealTypeFromHour, suggestNextMeals } from '@/utils/savedMeals'
import iconPlus from '@/assets/icons/plus.svg?raw'
import '@/styles/components/next-meal-card.css'

const props = defineProps<{
  remainingCalories: number | null
  todayMealIds: ReadonlySet<string>
  dayKey: string
}>()

const { t } = useI18n()
const { user } = useAuth()
const userId = computed(() => user.value?.id)
const mealsQuery = useMealsQuery(userId)
const addToToday = useAddMealToTodayMutation()
const busyId = ref<string | null>(null)
const mealType = resolveMealTypeFromHour(new Date().getHours())

const suggestions = computed(() =>
  suggestNextMeals({
    meals: mealsQuery.data.value ?? [],
    todayMealIds: props.todayMealIds,
    remainingCalories: props.remainingCalories,
    mealType,
    dayKey: props.dayKey,
    count: NEXT_MEAL_SUGGESTION_COUNT,
    headroom: NEXT_MEAL_REMAINING_HEADROOM,
  }),
)

async function onAdd(mealId: string): Promise<void> {
  const id = userId.value

  if (!id) {
    return
  }

  busyId.value = mealId

  try {
    await addToToday.mutateAsync({ userId: id, mealId, mealType })
  } finally {
    busyId.value = null
  }
}
</script>
