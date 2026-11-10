<template>
  <div class="saved-meals">
    <div class="saved-meals__tabs" role="tablist">
      <button
        v-for="tab in SAVED_MEAL_TABS"
        :key="tab"
        type="button"
        role="tab"
        class="saved-meals__tab"
        :class="{ 'saved-meals__tab--active': activeTab === tab }"
        :aria-selected="activeTab === tab"
        @click="activeTab = tab"
      >
        {{ t(`meals.saved.tabs.${tab}`) }}
      </button>
    </div>

    <p v-if="message" class="app-page__message" :class="messageClass" role="status">
      {{ message }}
    </p>

    <AppLoader v-if="isLoading" />

    <p
      v-else-if="listError"
      class="app-page__message app-page__message--error"
      role="alert"
    >
      {{ listError }}
    </p>

    <AppEmptyState
      v-else-if="visibleMeals.length === 0"
      :title="t(`meals.saved.empty.${activeTab}.title`)"
      :message="t(`meals.saved.empty.${activeTab}.message`)"
    />

    <ul v-else class="saved-meals__list">
      <li v-for="meal in visibleMeals" :key="meal.id" class="saved-meals__item">
        <button
          type="button"
          class="saved-meals__star"
          :class="{ 'saved-meals__star--on': meal.isFavorite }"
          :aria-pressed="meal.isFavorite"
          :aria-label="meal.isFavorite ? t('meals.saved.unfavorite') : t('meals.saved.favorite')"
          @click="toggleFavorite(meal)"
        >
          <span aria-hidden="true" v-html="iconStar" />
        </button>

        <div class="saved-meals__body">
          <p class="saved-meals__name">{{ meal.name }}</p>
          <p class="saved-meals__meta">
            {{
              t('meals.saved.meta', {
                calories: Math.round(meal.calories),
                weight: Math.round(meal.totalWeight),
              })
            }}
          </p>
          <div v-if="!compact" class="saved-meals__actions">
            <button type="button" class="saved-meals__link" @click="goToAddMeal(meal.id)">
              {{ t('meals.myMeals.edit') }}
            </button>
            <button
              type="button"
              class="saved-meals__link"
              :disabled="busyId === meal.id"
              @click="onDuplicate(meal.id)"
            >
              {{ t('meals.myMeals.duplicate') }}
            </button>
            <button
              type="button"
              class="saved-meals__link saved-meals__link--danger"
              :disabled="busyId === meal.id"
              @click="onDelete(meal)"
            >
              {{ t('meals.myMeals.delete') }}
            </button>
          </div>
        </div>

        <button
          type="button"
          class="saved-meals__add"
          :aria-label="t('meals.saved.addTo', { meal: t(`meals.${mealType}`) })"
          :disabled="busyId === meal.id"
          @click="onAdd(meal.id)"
        >
          <span aria-hidden="true" v-html="iconPlus" />
        </button>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import AppEmptyState from '@/components/common/AppEmptyState.vue'
import AppLoader from '@/components/common/AppLoader.vue'
import { useAppNavigation } from '@/composables/useAppNavigation'
import { useAuth } from '@/composables/useAuth'
import {
  SAVED_MEAL_TABS,
  SAVED_RECENT_DAYS,
  type MealType,
  type SavedMealTab,
} from '@/constants/meals'
import {
  useAddMealToTodayMutation,
  useDeleteMealMutation,
  useDuplicateMealMutation,
  useMealsQuery,
  useToggleMealFavoriteMutation,
  useWeekDailyEntriesQuery,
} from '@/queries/meals'
import type { MealWithIngredients } from '@/types'
import { resolveMealErrorI18nKey } from '@/utils/mealErrors'
import { buildRecentMeals } from '@/utils/savedMeals'
import iconPlus from '@/assets/icons/plus.svg?raw'
import iconStar from '@/assets/icons/star.svg?raw'
import '@/styles/components/saved-meals-list.css'

const props = withDefaults(
  defineProps<{
    mealType: MealType
    compact?: boolean
  }>(),
  { compact: false },
)

const emit = defineEmits<{
  added: [mealId: string]
}>()

const { t } = useI18n()
const { goToAddMeal } = useAppNavigation()
const { user } = useAuth()
const userId = computed(() => user.value?.id)

const mealsQuery = useMealsQuery(userId)
const historyQuery = useWeekDailyEntriesQuery(userId, SAVED_RECENT_DAYS)
const addToToday = useAddMealToTodayMutation()
const toggleFavoriteMutation = useToggleMealFavoriteMutation()
const duplicateMeal = useDuplicateMealMutation()
const deleteMeal = useDeleteMealMutation()

const meals = computed(() => mealsQuery.data.value ?? [])
const recentMeals = computed(() => buildRecentMeals(meals.value, historyQuery.data.value ?? []))
const activeTab = ref<SavedMealTab>(recentMeals.value.length ? 'recent' : 'all')
const busyId = ref<string | null>(null)

const stopInitialTab = watch(
  () => historyQuery.isFetched.value && mealsQuery.isFetched.value,
  (ready) => {
    if (ready) {
      activeTab.value = recentMeals.value.length ? 'recent' : 'all'
      stopInitialTab()
    }
  },
)
const message = ref('')
const isError = ref(false)

const messageClass = computed(() =>
  isError.value ? 'app-page__message--error' : 'app-page__message--success',
)

const isLoading = computed(() => mealsQuery.isPending.value && !mealsQuery.isFetched.value)

const listError = computed(() => {
  const error = mealsQuery.error.value
  return error ? t(resolveMealErrorI18nKey(String(error.message))) : ''
})

const visibleMeals = computed(() => {
  if (activeTab.value === 'recent') {
    return recentMeals.value
  }

  if (activeTab.value === 'favorites') {
    return meals.value.filter((meal) => meal.isFavorite)
  }

  return meals.value
})

async function run(mealId: string, action: () => Promise<unknown>, success: string): Promise<void> {
  busyId.value = mealId
  message.value = ''

  try {
    await action()
    isError.value = false
    message.value = success
  } catch (error) {
    isError.value = true
    message.value = t(resolveMealErrorI18nKey(error instanceof Error ? error.message : 'unknown'))
  } finally {
    busyId.value = null
  }
}

async function onAdd(mealId: string): Promise<void> {
  const id = userId.value

  if (!id) {
    return
  }

  await run(
    mealId,
    () => addToToday.mutateAsync({ userId: id, mealId, mealType: props.mealType }),
    t('meals.saved.added', { meal: t(`meals.${props.mealType}`) }),
  )

  if (!isError.value) {
    emit('added', mealId)
  }
}

function toggleFavorite(meal: MealWithIngredients): void {
  const id = userId.value

  if (id) {
    toggleFavoriteMutation.mutate({ userId: id, mealId: meal.id, isFavorite: !meal.isFavorite })
  }
}

async function onDuplicate(mealId: string): Promise<void> {
  const id = userId.value

  if (id) {
    await run(
      mealId,
      () => duplicateMeal.mutateAsync({ userId: id, mealId, copyLabel: t('meals.myMeals.copySuffix') }),
      t('meals.myMeals.duplicateSuccess'),
    )
  }
}

async function onDelete(meal: MealWithIngredients): Promise<void> {
  const id = userId.value

  if (id && window.confirm(t('meals.saved.confirmDelete', { name: meal.name }))) {
    await run(
      meal.id,
      () => deleteMeal.mutateAsync({ userId: id, mealId: meal.id }),
      t('meals.myMeals.deleteSuccess'),
    )
  }
}
</script>
