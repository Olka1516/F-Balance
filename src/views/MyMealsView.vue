<template>
  <AppPageShell wide>
    <template #title>
      {{ t('meals.myMeals.title') }}
    </template>
    <template #intro>
      {{ t('meals.myMeals.subtitle') }}
    </template>
    <template #actions>
      <AppButton type="button" @click="goToAddMeal()">
        {{ t('meals.myMeals.addNew') }}
      </AppButton>
    </template>

    <AppLoader v-if="isLoading" />

    <p
      v-else-if="listError"
      class="app-page__message app-page__message--error"
      role="alert"
    >
      {{ listError }}
    </p>

    <AppEmptyState
      v-else-if="meals.length === 0"
      :title="t('meals.myMeals.emptyTitle')"
      :message="t('meals.myMeals.emptyMessage')"
    >
      <AppButton type="button" @click="goToAddMeal()">
        {{ t('meals.myMeals.addNew') }}
      </AppButton>
    </AppEmptyState>

    <template v-else>
      <p
        v-if="actionError"
        class="app-page__message app-page__message--error"
        role="alert"
      >
        {{ actionError }}
      </p>
      <p
        v-if="actionSuccess"
        class="app-page__message app-page__message--success"
        role="status"
      >
        {{ actionSuccess }}
      </p>

      <ul class="my-meals-page__list">
        <li v-for="meal in meals" :key="meal.id" class="my-meals-page__item">
          <div class="my-meals-page__item-main">
            <p class="my-meals-page__item-type">
              {{ t(`meals.${meal.mealType}`) }}
            </p>
            <h2 class="my-meals-page__item-name">{{ meal.name }}</h2>
            <p class="my-meals-page__item-macros">
              {{
                t('meals.myMeals.macros', {
                  calories: meal.calories,
                  protein: meal.protein,
                  fat: meal.fat,
                  carbs: meal.carbs,
                  weight: meal.totalWeight,
                })
              }}
            </p>
          </div>
          <div class="my-meals-page__item-actions">
            <AppButton
              type="button"
              :variant="APP_BUTTON_VARIANT.secondary"
              :disabled="isBusy"
              @click="goToAddMeal(meal.id)"
            >
              {{ t('meals.myMeals.edit') }}
            </AppButton>
            <AppButton
              type="button"
              :variant="APP_BUTTON_VARIANT.secondary"
              :loading="pendingMealId === meal.id && isDuplicating"
              :disabled="isBusy"
              @click="onDuplicate(meal.id)"
            >
              {{ t('meals.myMeals.duplicate') }}
            </AppButton>
            <AppButton
              type="button"
              :loading="pendingMealId === meal.id && isAddingToday"
              :disabled="isBusy"
              @click="onAddToday(meal.id)"
            >
              {{ t('meals.myMeals.addToday') }}
            </AppButton>
            <AppButton
              type="button"
              :variant="APP_BUTTON_VARIANT.secondary"
              :loading="pendingMealId === meal.id && isDeleting"
              :disabled="isBusy"
              @click="onDelete(meal.id)"
            >
              {{ t('meals.myMeals.delete') }}
            </AppButton>
          </div>
        </li>
      </ul>
    </template>
  </AppPageShell>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import AppButton from '@/components/common/AppButton.vue'
import AppEmptyState from '@/components/common/AppEmptyState.vue'
import AppLoader from '@/components/common/AppLoader.vue'
import AppPageShell from '@/components/common/AppPageShell.vue'
import { useAppNavigation } from '@/composables/useAppNavigation'
import { useAuth } from '@/composables/useAuth'
import { APP_BUTTON_VARIANT } from '@/constants/ui'
import {
  useAddMealToTodayMutation,
  useDeleteMealMutation,
  useDuplicateMealMutation,
  useMealsQuery,
} from '@/queries/meals'
import { resolveMealErrorI18nKey } from '@/utils/mealErrors'
import '@/styles/views/my-meals.css'

const { t } = useI18n()
const { goToAddMeal } = useAppNavigation()
const { user } = useAuth()
const userId = computed(() => user.value?.id)

const mealsQuery = useMealsQuery(userId)
const deleteMeal = useDeleteMealMutation()
const duplicateMeal = useDuplicateMealMutation()
const addToToday = useAddMealToTodayMutation()

const actionError = ref('')
const actionSuccess = ref('')
const pendingMealId = ref<string | null>(null)
const isDeleting = ref(false)
const isDuplicating = ref(false)
const isAddingToday = ref(false)

const meals = computed(() => mealsQuery.data.value ?? [])
const isLoading = computed(
  () => mealsQuery.isPending.value && !mealsQuery.isFetched.value,
)
const isBusy = computed(
  () => isDeleting.value || isDuplicating.value || isAddingToday.value,
)
const listError = computed(() => {
  const error = mealsQuery.error.value

  if (!error) {
    return ''
  }

  return t(resolveMealErrorI18nKey(String(error.message)))
})

watch(
  () => mealsQuery.data.value,
  () => {
    actionError.value = ''
  },
)

async function onDuplicate(mealId: string): Promise<void> {
  const id = userId.value

  if (!id) {
    return
  }

  actionError.value = ''
  actionSuccess.value = ''
  pendingMealId.value = mealId
  isDuplicating.value = true

  try {
    await duplicateMeal.mutateAsync({
      userId: id,
      mealId,
      copyLabel: t('meals.myMeals.copySuffix'),
    })
    actionSuccess.value = t('meals.myMeals.duplicateSuccess')
  } catch (error) {
    actionError.value = t(
      resolveMealErrorI18nKey(
        error instanceof Error ? error.message : 'unknown',
      ),
    )
  } finally {
    isDuplicating.value = false
    pendingMealId.value = null
  }
}

async function onAddToday(mealId: string): Promise<void> {
  const id = userId.value

  if (!id) {
    return
  }

  actionError.value = ''
  actionSuccess.value = ''
  pendingMealId.value = mealId
  isAddingToday.value = true

  try {
    await addToToday.mutateAsync({ userId: id, mealId })
    actionSuccess.value = t('meals.myMeals.addTodaySuccess')
  } catch (error) {
    actionError.value = t(
      resolveMealErrorI18nKey(
        error instanceof Error ? error.message : 'unknown',
      ),
    )
  } finally {
    isAddingToday.value = false
    pendingMealId.value = null
  }
}

async function onDelete(mealId: string): Promise<void> {
  const id = userId.value

  if (!id) {
    return
  }

  actionError.value = ''
  actionSuccess.value = ''
  pendingMealId.value = mealId
  isDeleting.value = true

  try {
    await deleteMeal.mutateAsync({ userId: id, mealId })
    actionSuccess.value = t('meals.myMeals.deleteSuccess')
  } catch (error) {
    actionError.value = t(
      resolveMealErrorI18nKey(
        error instanceof Error ? error.message : 'unknown',
      ),
    )
  } finally {
    isDeleting.value = false
    pendingMealId.value = null
  }
}
</script>
