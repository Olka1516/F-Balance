<template>
  <div class="app-burger-nav">
    <div class="app-burger-nav__bar">
      <button
        type="button"
        class="app-burger-nav__toggle"
        :aria-expanded="isSidebarOpen"
        :aria-controls="menuId"
        :aria-label="t('common.nav.menuOpen')"
        @click="toggleSidebar()"
      >
        <span class="app-burger-nav__toggle-icon" aria-hidden="true" v-html="iconMenu" />
      </button>
      <p class="app-burger-nav__brand">{{ t('common.appName') }}</p>
      <AppLanguageSwitch />
    </div>

    <div
      v-if="isSidebarOpen"
      class="app-burger-nav__backdrop"
      aria-hidden="true"
      @click="closeSidebar()"
    />

    <nav
      :id="menuId"
      class="app-burger-nav__drawer"
      :class="{ 'app-burger-nav__drawer--open': isSidebarOpen }"
      :aria-hidden="!isSidebarOpen"
      :aria-label="t('common.nav.label')"
    >
      <div class="app-burger-nav__drawer-head">
        <p class="app-burger-nav__drawer-title">{{ t('common.nav.menuTitle') }}</p>
        <button
          type="button"
          class="app-burger-nav__close"
          :aria-label="t('common.nav.menuClose')"
          @click="closeSidebar()"
        >
          <span class="app-burger-nav__close-icon" aria-hidden="true" v-html="iconClose" />
        </button>
      </div>

      <ul class="app-burger-nav__list">
        <li v-for="item in navItems" :key="item.name">
          <RouterLink
            class="app-burger-nav__link"
            :to="{ name: item.name }"
            @click="closeSidebar()"
          >
            {{ t(item.labelKey) }}
          </RouterLink>
        </li>
      </ul>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { onUnmounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import AppLanguageSwitch from '@/components/common/AppLanguageSwitch.vue'
import { ROUTE_NAMES } from '@/constants/routes'
import { useUiStore } from '@/stores/ui'
import iconClose from '@/assets/icons/close.svg?raw'
import iconMenu from '@/assets/icons/menu.svg?raw'
import '@/styles/components/app-burger-nav.css'

const menuId = 'app-burger-nav-drawer'

const navItems = [
  { name: ROUTE_NAMES.dashboard, labelKey: 'common.nav.dashboard' },
  { name: ROUTE_NAMES.addMeal, labelKey: 'common.nav.addMeal' },
  { name: ROUTE_NAMES.myMeals, labelKey: 'common.nav.meals' },
  { name: ROUTE_NAMES.recommendations, labelKey: 'common.nav.recommendations' },
  { name: ROUTE_NAMES.profile, labelKey: 'common.nav.profile' },
] as const

const { t } = useI18n()
const uiStore = useUiStore()
const { isSidebarOpen } = storeToRefs(uiStore)
const { toggleSidebar, closeSidebar } = uiStore

watch(isSidebarOpen, (open) => {
  document.body.style.overflow = open ? 'hidden' : ''
})

onUnmounted(() => {
  document.body.style.overflow = ''
  closeSidebar()
})
</script>
