<template>
  <AppPageShell>
    <template #title>
      {{ isEditMode ? t('meals.add.editTitle') : t('meals.add.title') }}
    </template>
    <template #intro>
      {{ t('meals.add.subtitle') }}
    </template>

    <AppLoader v-if="isLoadingMeal" />

    <template v-else>
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
          {{ isSaving ? t('meals.add.saving') : t('meals.add.save') }}
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
  </AppPageShell>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import AppButton from '@/components/common/AppButton.vue'
import AppLoader from '@/components/common/AppLoader.vue'
import AppPageShell from '@/components/common/AppPageShell.vue'
import MealForm from '@/components/meals/MealForm.vue'
import { useAppNavigation } from '@/composables/useAppNavigation'
import { useAuth } from '@/composables/useAuth'
import { useMealQuery, useSaveManualMealMutation } from '@/queries/meals'
import { resolveMealErrorI18nKey } from '@/utils/mealErrors'
import {
  createEmptyMealForm,
  formValuesToManualMealInput,
  mealToFormValues,
} from '@/utils/mealForm'

const { t } = useI18n()
const route = useRoute()
const { goToMyMeals } = useAppNavigation()
const { user } = useAuth()
const userId = computed(() => user.value?.id)
const mealId = computed(() => {
  const value = route.query.mealId
  return typeof value === 'string' && value ? value : undefined
})
const isEditMode = computed(() => Boolean(mealId.value))

const mealQuery = useMealQuery(userId, mealId)
const saveMeal = useSaveManualMealMutation()

const form = ref(createEmptyMealForm())
const mealFormRef = ref<{ validate: () => Promise<boolean> } | null>(null)
const formError = ref('')
const formSuccess = ref('')
const isSaving = ref(false)

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
      return
    }

    if (!mealId.value) {
      form.value = createEmptyMealForm()
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

async function onSave(): Promise<void> {
  formError.value = ''
  formSuccess.value = ''

  const valid = await mealFormRef.value?.validate()

  if (!valid) {
    return
  }

  const id = userId.value
  const input = formValuesToManualMealInput(form.value)

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
    })
    formSuccess.value = isEditMode.value
      ? t('meals.add.updateSuccess')
      : t('meals.add.createSuccess')
    goToMyMeals()
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
