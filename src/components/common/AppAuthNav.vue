<template>
  <nav class="app-auth-nav" :aria-label="t('common.nav.label')">
    <RouterLink
      class="app-auth-nav__link"
      :to="{ name: ROUTE_NAMES.dashboard }"
    >
      {{ t('common.nav.dashboard') }}
    </RouterLink>
    <RouterLink
      class="app-auth-nav__link"
      :to="{ name: ROUTE_NAMES.addMeal }"
    >
      {{ t('common.nav.addMeal') }}
    </RouterLink>
    <RouterLink
      class="app-auth-nav__link"
      :to="{ name: ROUTE_NAMES.myMeals }"
    >
      {{ t('common.nav.meals') }}
    </RouterLink>
    <RouterLink
      class="app-auth-nav__link"
      :to="{ name: ROUTE_NAMES.recommendations }"
    >
      {{ t('common.nav.recommendations') }}
    </RouterLink>
    <RouterLink
      class="app-auth-nav__link"
      :to="{ name: ROUTE_NAMES.profile }"
    >
      {{ t('common.nav.profile') }}
    </RouterLink>
    <AppLanguageSwitch />
  </nav>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import AppLanguageSwitch from '@/components/common/AppLanguageSwitch.vue'
import { ROUTE_NAMES } from '@/constants/routes'
import '@/styles/components/app-auth-nav.css'

const { t } = useI18n()
</script>
