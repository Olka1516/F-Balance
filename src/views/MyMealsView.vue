<template>
  <AppPageShell bare>
    <div class="my-meals-page">
      <header class="my-meals-page__header">
        <h1 class="my-meals-page__title">{{ t('meals.myMeals.title') }}</h1>
        <AppButton type="button" @click="goToAddMeal()">
          <span class="my-meals-page__icon" aria-hidden="true" v-html="iconPlus" />
          {{ t('meals.myMeals.addNew') }}
        </AppButton>
      </header>

      <SavedMealsList :meal-type="mealType" />
    </div>
  </AppPageShell>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import iconPlus from '@/assets/icons/plus.svg?raw'
import AppButton from '@/components/common/AppButton.vue'
import AppPageShell from '@/components/common/AppPageShell.vue'
import SavedMealsList from '@/components/meals/SavedMealsList.vue'
import { useAppNavigation } from '@/composables/useAppNavigation'
import { resolveMealTypeFromHour } from '@/utils/savedMeals'
import '@/styles/views/my-meals.css'

const { t } = useI18n()
const { goToAddMeal } = useAppNavigation()
const mealType = resolveMealTypeFromHour(new Date().getHours())
</script>
