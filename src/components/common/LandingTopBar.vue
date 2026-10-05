<template>
  <header class="landing-top-bar">
    <nav class="landing-top-bar__pill" :aria-label="t('common.landing.navLabel')">
      <div class="landing-top-bar__group landing-top-bar__group--start">
        <button
          type="button"
          class="landing-top-bar__link landing-top-bar__link--active"
        >
          {{ t('common.landing.nav.home') }}
        </button>
        <button type="button" class="landing-top-bar__link" @click="goToLogin">
          {{ t('common.landing.nav.login') }}
        </button>
      </div>

      <div class="landing-top-bar__brand">
        <div class="landing-top-bar__logo" aria-hidden="true">
          <span class="landing-top-bar__logo-mark">F</span>
        </div>
        <span class="landing-top-bar__brand-name">{{ t('common.appName') }}</span>
      </div>

      <div class="landing-top-bar__group landing-top-bar__group--end">
        <AppLanguageSwitch class="landing-top-bar__lang" />
        <button
          type="button"
          class="landing-top-bar__cta"
          @click="goToRegister"
        >
          {{ t('common.landing.nav.signUp') }}
        </button>
      </div>
    </nav>
  </header>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import AppLanguageSwitch from '@/components/common/AppLanguageSwitch.vue'
import { useAppNavigation } from '@/composables/useAppNavigation'
import '@/styles/components/landing-top-bar.css'

const { t } = useI18n()
const { goToRegister, goToLogin } = useAppNavigation()
</script>
