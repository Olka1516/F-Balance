<template>
  <AppPageShell>
    <template #title>
      {{ isEditMode ? t('meals.add.editTitle') : t('meals.add.title') }}
    </template>
    <template #intro>
      {{
        isEditMode ? t('meals.add.editSubtitle') : t('meals.add.subtitle')
      }}
    </template>

    <AppLoader v-if="isLoadingMeal" />

    <template v-else>
      <div v-if="!isEditMode" class="add-meal-page__tabs" role="tablist">
        <button
          v-for="tab in ADD_MEAL_ENTRY_TABS"
          :key="tab"
          type="button"
          role="tab"
          class="add-meal-page__tab"
          :class="{ 'add-meal-page__tab--active': activeTab === tab }"
          :aria-selected="activeTab === tab"
          @click="activeTab = tab"
        >
          {{ t(`meals.add.tabs.${tab}`) }}
        </button>
      </div>

      <FoodSearchPanel
        v-if="!isEditMode && activeTab === 'search'"
        @select="onSelectSearchHit"
      />

      <MealAiPanel
        v-else-if="!isEditMode && activeTab === 'ai'"
        @estimated="onAiEstimated"
      />

      <template v-else>
        <p v-if="entryNotice" class="add-meal-page__notice" role="status">
          {{ entryNotice }}
        </p>

        <MealForm ref="mealFormRef" v-model="form" />

        <p
          v-if="formError"
          class="app-page__message app-page__message--error"
          role="alert"
        >
          {{ formError }}
        </p>
        <p
          v-if="formSuccess"
          class="app-page__message app-page__message--success"
          role="status"
        >
          {{ formSuccess }}
        </p>

        <div class="app-page__actions">
          <AppButton
            type="button"
            :loading="isSaving"
            :disabled="isSaving"
            @click="onSave"
          >
            {{ isSaving ? t('meals.add.saving') : saveLabel }}
          </AppButton>
          <button
            type="button"
            class="app-page__link-action"
            :disabled="isSaving"
            @click="goToMyMeals"
          >
            {{ t('meals.add.toMyMeals') }}
          </button>
        </div>
      </template>
    </template>
  </AppPageShell>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import AppButton from '@/components/common/AppButton.vue'
import AppLoader from '@/components/common/AppLoader.vue'
import AppPageShell from '@/components/common/AppPageShell.vue'
import FoodSearchPanel from '@/components/meals/FoodSearchPanel.vue'
import MealAiPanel from '@/components/meals/MealAiPanel.vue'
import MealForm from '@/components/meals/MealForm.vue'
import { useAppNavigation } from '@/composables/useAppNavigation'
import { useAuth } from '@/composables/useAuth'
import {
  ADD_MEAL_ENTRY_TAB_DEFAULT,
  ADD_MEAL_ENTRY_TABS,
  FOOD_SOURCE_AI,
  FOOD_SOURCE_MANUAL,
  FOOD_SOURCE_OPEN_FOOD_FACTS,
  type AddMealEntryTab,
} from '@/constants/meals'
import { useMealQuery, useSaveManualMealMutation } from '@/queries/meals'
import type { AiNutritionEstimate, FoodSearchHit, FoodSource } from '@/types'
import { resolveMealErrorI18nKey } from '@/utils/mealErrors'
import {
  aiEstimateToFormValues,
  createEmptyMealForm,
  foodSearchHitToFormValues,
  formValuesToManualMealInput,
  mealToFormValues,
} from '@/utils/mealForm'
import '@/styles/views/add-meal.css'

const { t } = useI18n()
const route = useRoute()
const { goToDashboard, goToMyMeals } = useAppNavigation()
const { user } = useAuth()
const userId = computed(() => user.value?.id)
const mealId = computed(() => {
  const value = route.query.mealId
  return typeof value === 'string' && value ? value : undefined
})
const isEditMode = computed(() => Boolean(mealId.value))
const saveLabel = computed(() =>
  isEditMode.value ? t('meals.add.save') : t('meals.add.saveAndLog'),
)

const mealQuery = useMealQuery(userId, mealId)
const saveMeal = useSaveManualMealMutation()

const form = ref(createEmptyMealForm())
const mealFormRef = ref<{ validate: () => Promise<boolean> } | null>(null)
const formError = ref('')
const formSuccess = ref('')
const entryNotice = ref('')
const isSaving = ref(false)
const activeTab = ref<AddMealEntryTab>(ADD_MEAL_ENTRY_TAB_DEFAULT)
const foodSource = ref<FoodSource>(FOOD_SOURCE_MANUAL)

const isLoadingMeal = computed(
  () =>
    Boolean(mealId.value) &&
    mealQuery.isPending.value &&
    !mealQuery.isFetched.value,
)

watch(
  () => mealQuery.data.value,
  (meal) => {
    if (meal) {
      form.value = mealToFormValues(meal)
      foodSource.value = meal.ingredients[0]?.food.source ?? FOOD_SOURCE_MANUAL
      activeTab.value = 'manual'
      return
    }

    if (!mealId.value) {
      form.value = createEmptyMealForm()
      foodSource.value = FOOD_SOURCE_MANUAL
    }
  },
  { immediate: true },
)

watch(
  () => mealQuery.error.value,
  (error) => {
    if (!error) {
      return
    }

    formError.value = t(resolveMealErrorI18nKey(String(error.message)))
  },
)

function onSelectSearchHit(hit: FoodSearchHit): void {
  form.value = foodSearchHitToFormValues(hit, form.value.mealType)
  foodSource.value = FOOD_SOURCE_OPEN_FOOD_FACTS
  activeTab.value = 'manual'
  formError.value = ''
  entryNotice.value = hit.isComplete
    ? t('meals.search.applied')
    : t('meals.search.appliedIncomplete')
}

function onAiEstimated(payload: AiNutritionEstimate): void {
  form.value = aiEstimateToFormValues({
    calories: payload.calories,
    protein: payload.protein,
    fat: payload.fat,
    carbs: payload.carbs,
    mealType: form.value.mealType,
    name: payload.name,
  })
  foodSource.value = FOOD_SOURCE_AI
  activeTab.value = 'manual'
  formError.value = ''
  entryNotice.value = t('meals.ai.applied', {
    calories: payload.calories,
  })
}

async function onSave(): Promise<void> {
  formError.value = ''
  formSuccess.value = ''

  const valid = await mealFormRef.value?.validate()

  if (!valid) {
    return
  }

  const id = userId.value
  const input = formValuesToManualMealInput(form.value, foodSource.value)

  if (!id || !input) {
    formError.value = t('meals.errors.unknown')
    return
  }

  isSaving.value = true

  try {
    await saveMeal.mutateAsync({
      userId: id,
      mealId: mealId.value,
      input,
      logToToday: !isEditMode.value,
    })
    formSuccess.value = isEditMode.value
      ? t('meals.add.updateSuccess')
      : t('meals.add.createSuccess')

    if (isEditMode.value) {
      goToMyMeals()
      return
    }

    goToDashboard()
  } catch (error) {
    formError.value = t(
      resolveMealErrorI18nKey(
        error instanceof Error ? error.message : 'unknown',
      ),
    )
  } finally {
    isSaving.value = false
  }
}
</script>
