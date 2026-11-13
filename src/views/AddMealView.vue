<template>
  <AppPageShell bare :show-nav="false">
    <div class="add-meal-page" :class="{ 'add-meal-page--camera': isCameraStep }">
      <header class="add-meal-page__header">
        <button
          type="button"
          class="add-meal-page__round"
          :aria-label="headerBackLabel"
          @click="onHeaderBack"
        >
          <span class="add-meal-page__icon" aria-hidden="true" v-html="isReview && !isEditMode ? iconChevronLeft : iconClose" />
        </button>
        <h1 class="add-meal-page__title">{{ pageTitle }}</h1>
        <span class="add-meal-page__spacer" aria-hidden="true" />
      </header>

      <AppLoader v-if="isLoadingMeal" />

      <div v-else-if="isReview" class="add-meal-page__body add-meal-page__review">
        <img
          v-if="showPhotoPreview"
          class="add-meal-page__photo"
          :src="ai.photoPreviewUrl.value"
          :alt="t('meals.ai.capturedPhotoName')"
        />

        <section class="add-meal-page__summary" :aria-label="t('meals.add.summaryAria')">
          <p class="add-meal-page__summary-kcal">
            {{ summary.calories }}
            <span class="add-meal-page__summary-unit">{{ t('dashboard.summary.kcal') }}</span>
          </p>
          <p class="add-meal-page__summary-macros">
            {{ t('dashboard.meals.macrosShort', summary) }}
          </p>
        </section>

        <p
          v-if="entryNotice"
          class="add-meal-page__notice"
          :class="{ 'add-meal-page__notice--warning': entryNoticeIsWarning }"
          role="status"
        >
          {{ entryNotice }}
        </p>

        <MealAiRefine
          v-if="canRefine"
          :analyzing="ai.isAnalyzing.value"
          :cooldown-seconds="ai.cooldownSeconds.value"
          @refine="ai.refine"
        />
        <p v-if="ai.errorMessage.value" class="app-page__message app-page__message--error" role="alert">
          {{ ai.errorMessage.value }}
        </p>

        <MealForm
          ref="mealFormRef"
          v-model="form"
          :scale-with-amount="isEditMode || foodSource !== FOOD_SOURCE_MANUAL"
        />

        <p v-if="formError" class="app-page__message app-page__message--error" role="alert">
          {{ formError }}
        </p>
        <p v-if="formSuccess" class="app-page__message app-page__message--success" role="status">
          {{ formSuccess }}
        </p>

        <div class="add-meal-page__actions">
          <AppButton type="button" :loading="isSaving" :disabled="isSaving" @click="onSave">
            {{ isSaving ? t('meals.add.saving') : saveLabel }}
          </AppButton>
          <button type="button" class="app-page__link-action" :disabled="isSaving" @click="goToMyMeals">
            {{ t('meals.add.toMyMeals') }}
          </button>
        </div>
      </div>

      <template v-else>
        <MealCameraCapture
          v-if="activeTab === 'photo'"
          v-model:clarification="photoNote"
          :analyzing="ai.isAnalyzing.value"
          @photo="onPhoto"
        />

        <div v-else class="add-meal-page__body">
          <MealDescribePanel
            v-if="activeTab === 'text'"
            v-model="description"
            :analyzing="ai.isAnalyzing.value"
            @analyze="ai.submitText"
          />
          <FoodSearchPanel v-else-if="activeTab === 'search'" @select="onSelectSearchHit" />
          <SavedMealsList
            v-else-if="activeTab === 'saved'"
            compact
            :meal-type="targetMealType"
            @added="goToDashboard"
          />
        </div>

        <p
          v-if="ai.errorMessage.value"
          class="add-meal-page__error app-page__message app-page__message--error"
          role="alert"
        >
          {{ ai.errorMessage.value }}
        </p>

        <nav class="add-meal-page__modes" :aria-label="t('meals.add.modesAria')">
          <button
            v-for="tab in ADD_MEAL_ENTRY_TABS"
            :key="tab"
            type="button"
            class="add-meal-page__mode"
            :class="{ 'add-meal-page__mode--active': activeTab === tab }"
            :aria-current="activeTab === tab ? 'page' : undefined"
            @click="selectTab(tab)"
          >
            {{ t(`meals.add.tabs.${tab}`) }}
          </button>
        </nav>
      </template>
    </div>
  </AppPageShell>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import iconChevronLeft from '@/assets/icons/chevron-left.svg?raw'
import iconClose from '@/assets/icons/close.svg?raw'
import AppButton from '@/components/common/AppButton.vue'
import AppLoader from '@/components/common/AppLoader.vue'
import AppPageShell from '@/components/common/AppPageShell.vue'
import FoodSearchPanel from '@/components/meals/FoodSearchPanel.vue'
import MealAiRefine from '@/components/meals/MealAiRefine.vue'
import MealCameraCapture from '@/components/meals/MealCameraCapture.vue'
import MealDescribePanel from '@/components/meals/MealDescribePanel.vue'
import MealForm from '@/components/meals/MealForm.vue'
import SavedMealsList from '@/components/meals/SavedMealsList.vue'
import { useAppNavigation } from '@/composables/useAppNavigation'
import { useAuth } from '@/composables/useAuth'
import { useMealAiAnalysis } from '@/composables/useMealAiAnalysis'
import {
  ADD_MEAL_ENTRY_TAB_DEFAULT,
  ADD_MEAL_ENTRY_TABS,
  FOOD_SOURCE_AI,
  FOOD_SOURCE_MANUAL,
  FOOD_SOURCE_OPEN_FOOD_FACTS,
  type AddMealEntryTab,
  type MealType,
} from '@/constants/meals'
import { useMealQuery, useSaveManualMealMutation } from '@/queries/meals'
import type { AiNutritionEstimate, FoodSearchHit, FoodSource } from '@/types'
import { isEmptyAiEstimate } from '@/utils/aiEstimate'
import { resolveMealErrorI18nKey } from '@/utils/mealErrors'
import {
  aiEstimateToFormValues,
  createEmptyMealForm,
  foodSearchHitToFormValues,
  formValuesToManualMealInput,
  isMealType,
  mealToFormValues,
} from '@/utils/mealForm'
import { resolveMealTypeFromHour } from '@/utils/savedMeals'
import '@/styles/views/add-meal.css'

const { t, locale } = useI18n()
const route = useRoute()
const router = useRouter()
const { goToDashboard, goToMyMeals } = useAppNavigation()
const { user } = useAuth()
const userId = computed(() => user.value?.id)
const mealId = computed(() => {
  const value = route.query.mealId
  return typeof value === 'string' && value ? value : undefined
})
const isEditMode = computed(() => Boolean(mealId.value))
const targetMealType = computed<MealType>(() => {
  const value = route.query.mealType
  return typeof value === 'string' && isMealType(value)
    ? value
    : resolveMealTypeFromHour(new Date().getHours())
})
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
const entryNoticeIsWarning = ref(false)
const isSaving = ref(false)
const activeTab = ref<AddMealEntryTab>(ADD_MEAL_ENTRY_TAB_DEFAULT)
const step = ref<'entry' | 'review'>('entry')
const foodSource = ref<FoodSource>(FOOD_SOURCE_MANUAL)
const photoNote = ref('')
const description = ref('')

const ai = useMealAiAnalysis({
  locale: computed(() => String(locale.value)),
  onEstimated: onAiEstimated,
})

const isReview = computed(() => isEditMode.value || step.value === 'review')
const isCameraStep = computed(() => !isReview.value && activeTab.value === 'photo')
const canRefine = computed(() => foodSource.value === FOOD_SOURCE_AI && ai.source.value !== null)
const showPhotoPreview = computed(() => canRefine.value && ai.source.value === 'photo')

const isLoadingMeal = computed(
  () =>
    Boolean(mealId.value) &&
    mealQuery.isPending.value &&
    !mealQuery.isFetched.value,
)

const pageTitle = computed(() => {
  if (isEditMode.value) {
    return t('meals.add.editTitle')
  }

  if (isReview.value) {
    return t('meals.add.reviewTitle')
  }

  return t('meals.add.titleFor', { meal: t(`meals.${targetMealType.value}`) })
})

const headerBackLabel = computed(() =>
  isReview.value && !isEditMode.value ? t('meals.add.back') : t('meals.add.close'),
)

const summary = computed(() => ({
  calories: toWhole(form.value.calories),
  protein: toWhole(form.value.protein),
  fat: toWhole(form.value.fat),
  carbs: toWhole(form.value.carbs),
}))

watch(
  () => mealQuery.data.value,
  (meal) => {
    if (meal) {
      form.value = mealToFormValues(meal)
      foodSource.value = meal.ingredients[0]?.food.source ?? FOOD_SOURCE_MANUAL
      return
    }

    if (!mealId.value) {
      form.value = { ...createEmptyMealForm(), mealType: targetMealType.value }
      foodSource.value = FOOD_SOURCE_MANUAL
    }
  },
  { immediate: true },
)

watch(
  () => mealQuery.error.value,
  (error) => {
    if (error) {
      formError.value = t(resolveMealErrorI18nKey(String(error.message)))
    }
  },
)

function toWhole(value: string | number | null | undefined): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? Math.round(parsed) : 0
}

function openReview(): void {
  formError.value = ''
  formSuccess.value = ''
  step.value = 'review'
}

function selectTab(tab: AddMealEntryTab): void {
  ai.clearError()

  if (tab === 'manual') {
    form.value = { ...createEmptyMealForm(), mealType: form.value.mealType }
    foodSource.value = FOOD_SOURCE_MANUAL
    entryNotice.value = ''
    openReview()
    return
  }

  activeTab.value = tab
}

function onHeaderBack(): void {
  if (isReview.value && !isEditMode.value) {
    step.value = 'entry'
    entryNotice.value = ''
    ai.clearError()
    return
  }

  if (window.history.state?.back) {
    router.back()
    return
  }

  goToDashboard()
}

function onPhoto(file: File): void {
  ai.submitPhoto(file, photoNote.value)
}

function onSelectSearchHit(hit: FoodSearchHit): void {
  form.value = foodSearchHitToFormValues(hit, form.value.mealType)
  foodSource.value = FOOD_SOURCE_OPEN_FOOD_FACTS
  entryNoticeIsWarning.value = !hit.isComplete
  entryNotice.value = hit.isComplete
    ? t('meals.search.applied')
    : t('meals.search.appliedIncomplete')
  openReview()
}

function onAiEstimated(payload: AiNutritionEstimate): void {
  const empty = isEmptyAiEstimate(payload)

  form.value = aiEstimateToFormValues({
    calories: empty ? 0 : payload.calories,
    protein: empty ? 0 : payload.protein,
    fat: empty ? 0 : payload.fat,
    carbs: empty ? 0 : payload.carbs,
    mealType: form.value.mealType,
    name: empty ? null : payload.name,
    amountGrams: empty ? undefined : payload.amountGrams ?? undefined,
  })
  foodSource.value = FOOD_SOURCE_AI

  if (empty) {
    form.value.name = ''
    entryNoticeIsWarning.value = true
    entryNotice.value = t('meals.ai.emptyResult')
  } else {
    entryNoticeIsWarning.value = false
    entryNotice.value = t('meals.ai.applied', { amount: form.value.amount })
  }

  openReview()
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

    if (isEditMode.value && window.history.state?.back) {
      router.back()
      return
    }

    goToDashboard()
  } catch (error) {
    formError.value = t(
      resolveMealErrorI18nKey(error instanceof Error ? error.message : 'unknown'),
    )
  } finally {
    isSaving.value = false
  }
}
</script>
