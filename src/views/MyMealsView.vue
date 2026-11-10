<template>
  <AppPageShell wide>
    <template #title>
      {{ t('meals.myMeals.title') }}
    </template>
    <template #intro>
      {{ t('meals.myMeals.subtitle', { meal: t(`meals.${mealType}`) }) }}
    </template>
    <template #actions>
      <AppButton type="button" @click="goToAddMeal()">
        {{ t('meals.myMeals.addNew') }}
      </AppButton>
    </template>

    <SavedMealsList :meal-type="mealType" />
  </AppPageShell>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import AppButton from '@/components/common/AppButton.vue'
import AppPageShell from '@/components/common/AppPageShell.vue'
import SavedMealsList from '@/components/meals/SavedMealsList.vue'
import { useAppNavigation } from '@/composables/useAppNavigation'
import { resolveMealTypeFromHour } from '@/utils/savedMeals'

const { t } = useI18n()
const { goToAddMeal } = useAppNavigation()
const mealType = resolveMealTypeFromHour(new Date().getHours())
</script>
