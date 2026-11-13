<template>
  <div class="saved-meals">
    <div class="saved-meals__toolbar">
      <label class="saved-meals__search">
        <span class="saved-meals__search-icon" aria-hidden="true" v-html="iconSearch" />
        <span class="saved-meals__visually-hidden">{{ t('meals.saved.searchLabel') }}</span>
        <input
          v-model="query"
          class="saved-meals__search-input"
          type="search"
          :placeholder="t('meals.saved.searchPlaceholder')"
        />
      </label>

      <div class="saved-meals__filters" role="group" :aria-label="t('meals.saved.filterAria')">
        <button
          v-for="item in SAVED_MEAL_FILTERS"
          :key="item"
          type="button"
          class="saved-meals__filter"
          :class="{ 'saved-meals__filter--active': filter === item }"
          :aria-pressed="filter === item"
          @click="filter = item"
        >
          {{ t(`meals.saved.filters.${item}`) }}
        </button>
      </div>

      <div class="saved-meals__summary">
        <span>{{ t('meals.saved.count', { count: visibleMeals.length }) }}</span>
        <label class="saved-meals__sort">
          <span class="saved-meals__visually-hidden">{{ t('meals.saved.sortLabel') }}</span>
          <select v-model="sort" class="saved-meals__sort-select">
            <option v-for="item in SAVED_MEAL_SORTS" :key="item" :value="item">
              {{ t(`meals.saved.sorts.${item}`) }}
            </option>
          </select>
        </label>
      </div>
    </div>

    <AppLoader v-if="isLoading" />

    <p v-else-if="listError" class="app-page__message app-page__message--error" role="alert">
      {{ listError }}
    </p>

    <AppEmptyState
      v-else-if="visibleMeals.length === 0"
      :title="t(`meals.saved.empty.${emptyKey}.title`)"
      :message="t(`meals.saved.empty.${emptyKey}.message`)"
    />

    <ul v-else class="saved-meals__list">
      <SavedMealCard
        v-for="meal in visibleMeals"
        :key="meal.id"
        :meal="meal"
        :meal-label="mealLabel"
        :compact="compact"
        :busy="busyId === meal.id"
        :added="addedId === meal.id"
        @add="onAdd(meal)"
        @favorite="toggleFavorite(meal)"
        @edit="goToAddMeal(meal.id)"
        @duplicate="onDuplicate(meal)"
        @delete="onDelete(meal)"
      />
    </ul>

    <div v-if="toast" class="saved-meals__toast" :class="{ 'saved-meals__toast--error': toast.isError }" role="status">
      <span class="saved-meals__toast-text">{{ toast.text }}</span>
      <button v-if="pendingDelete" type="button" class="saved-meals__toast-action" @click="undoDelete">
        {{ t('meals.saved.undo') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import iconSearch from '@/assets/icons/search.svg?raw'
import AppEmptyState from '@/components/common/AppEmptyState.vue'
import AppLoader from '@/components/common/AppLoader.vue'
import SavedMealCard from '@/components/meals/SavedMealCard.vue'
import { useAppNavigation } from '@/composables/useAppNavigation'
import { useAuth } from '@/composables/useAuth'
import {
  SAVED_MEAL_ADDED_FLASH_MS,
  SAVED_MEAL_FILTERS,
  SAVED_MEAL_SORTS,
  SAVED_MEAL_UNDO_MS,
  SAVED_RECENT_DAYS,
  type MealType,
  type SavedMealFilter,
  type SavedMealSort,
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
import { arrangeSavedMeals, buildRecentMeals } from '@/utils/savedMeals'
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

const query = ref('')
const filter = ref<SavedMealFilter>('all')
const sort = ref<SavedMealSort>('recent')
const busyId = ref<string | null>(null)
const addedId = ref<string | null>(null)
const toast = ref<{ text: string; isError: boolean } | null>(null)
const pendingDelete = ref<{ meal: MealWithIngredients; timer: ReturnType<typeof setTimeout> } | null>(null)
let toastTimer: ReturnType<typeof setTimeout> | undefined
let addedTimer: ReturnType<typeof setTimeout> | undefined

const mealLabel = computed(() => t(`meals.${props.mealType}`))
const meals = computed(() => mealsQuery.data.value ?? [])
const recentMeals = computed(() => buildRecentMeals(meals.value, historyQuery.data.value ?? []))
const isLoading = computed(() => mealsQuery.isPending.value && !mealsQuery.isFetched.value)

const listError = computed(() => {
  const error = mealsQuery.error.value
  return error ? t(resolveMealErrorI18nKey(String(error.message))) : ''
})

const visibleMeals = computed(() =>
  arrangeSavedMeals({
    meals: meals.value.filter((meal) => meal.id !== pendingDelete.value?.meal.id),
    recent: recentMeals.value,
    query: query.value,
    filter: filter.value,
    sort: sort.value,
  }),
)

const emptyKey = computed(() => {
  if (query.value.trim()) {
    return 'search'
  }

  return filter.value === 'favorites' ? 'favorites' : 'all'
})

onBeforeUnmount(() => {
  clearTimeout(toastTimer)
  clearTimeout(addedTimer)
  commitPendingDelete()
})

function showToast(text: string, isError = false, duration = SAVED_MEAL_UNDO_MS): void {
  clearTimeout(toastTimer)
  toast.value = { text, isError }
  toastTimer = setTimeout(() => {
    toast.value = null
  }, duration)
}

function errorText(error: unknown): string {
  return t(resolveMealErrorI18nKey(error instanceof Error ? error.message : 'unknown'))
}

async function onAdd(meal: MealWithIngredients): Promise<void> {
  const id = userId.value

  if (!id) {
    return
  }

  commitPendingDelete()
  busyId.value = meal.id

  try {
    await addToToday.mutateAsync({ userId: id, mealId: meal.id, mealType: props.mealType })
    clearTimeout(addedTimer)
    addedId.value = meal.id
    addedTimer = setTimeout(() => {
      addedId.value = null
    }, SAVED_MEAL_ADDED_FLASH_MS)
    showToast(t('meals.saved.addedNamed', { name: meal.name, meal: mealLabel.value }))
    emit('added', meal.id)
  } catch (error) {
    showToast(errorText(error), true)
  } finally {
    busyId.value = null
  }
}

function toggleFavorite(meal: MealWithIngredients): void {
  const id = userId.value

  if (id) {
    toggleFavoriteMutation.mutate({ userId: id, mealId: meal.id, isFavorite: !meal.isFavorite })
  }
}

async function onDuplicate(meal: MealWithIngredients): Promise<void> {
  const id = userId.value

  if (!id) {
    return
  }

  commitPendingDelete()
  busyId.value = meal.id

  try {
    await duplicateMeal.mutateAsync({ userId: id, mealId: meal.id, copyLabel: t('meals.myMeals.copySuffix') })
    showToast(t('meals.myMeals.duplicateSuccess'))
  } catch (error) {
    showToast(errorText(error), true)
  } finally {
    busyId.value = null
  }
}

function onDelete(meal: MealWithIngredients): void {
  commitPendingDelete()
  pendingDelete.value = {
    meal,
    timer: setTimeout(commitPendingDelete, SAVED_MEAL_UNDO_MS),
  }
  showToast(t('meals.saved.deletedNamed', { name: meal.name }))
}

function undoDelete(): void {
  if (pendingDelete.value) {
    clearTimeout(pendingDelete.value.timer)
    pendingDelete.value = null
  }

  toast.value = null
}

function commitPendingDelete(): void {
  const pending = pendingDelete.value
  const id = userId.value

  if (!pending) {
    return
  }

  clearTimeout(pending.timer)
  pendingDelete.value = null

  if (id) {
    deleteMeal.mutateAsync({ userId: id, mealId: pending.meal.id }).catch((error: unknown) => {
      showToast(errorText(error), true)
    })
  }
}
</script>
