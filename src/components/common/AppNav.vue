<template>
  <nav class="app-nav" :aria-label="t('common.nav.label')">
    <p class="app-nav__brand">{{ t('common.appName') }}</p>

    <ul class="app-nav__list">
      <li
        v-for="item in APP_NAV_ITEMS"
        :key="item.name"
        class="app-nav__item"
        :class="{ 'app-nav__item--primary': item.primary }"
      >
        <RouterLink
          class="app-nav__link"
          :class="{ 'app-nav__link--active': isActive(item.name) }"
          :to="{ name: item.name }"
          :aria-current="isActive(item.name) ? 'page' : undefined"
        >
          <span class="app-nav__icon" aria-hidden="true" v-html="NAV_ICONS[item.icon]" />
          <span class="app-nav__label">{{ t(item.labelKey) }}</span>
        </RouterLink>
      </li>
    </ul>

    <div class="app-nav__footer">
      <AppLanguageSwitch />
    </div>
  </nav>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import AppLanguageSwitch from '@/components/common/AppLanguageSwitch.vue'
import { APP_NAV_ITEMS, type AppNavIcon } from '@/constants/routes'
import iconMeals from '@/assets/icons/meals.svg?raw'
import iconPlus from '@/assets/icons/plus.svg?raw'
import iconProfile from '@/assets/icons/profile.svg?raw'
import iconProgress from '@/assets/icons/progress.svg?raw'
import iconToday from '@/assets/icons/today.svg?raw'
import '@/styles/components/app-nav.css'

const NAV_ICONS: Record<AppNavIcon, string> = {
  today: iconToday,
  meals: iconMeals,
  plus: iconPlus,
  progress: iconProgress,
  profile: iconProfile,
}

const { t } = useI18n()
const route = useRoute()

function isActive(name: string): boolean {
  return route.name === name
}
</script>
