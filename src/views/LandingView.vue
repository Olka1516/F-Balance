<template>
  <div class="landing-page">
    <LandingTopBar />

    <main class="landing-page__main">
      <section class="landing-page__hero">
        <div class="landing-page__intro">
          <h1 class="landing-page__headline">
            {{ t('common.landing.headlineLine1') }}
            <span class="landing-page__headline-accent">{{
              t('common.landing.headlineLine2')
            }}</span>
          </h1>
          <p class="landing-page__lead">{{ t('common.landing.tagline') }}</p>
        </div>

        <LandingHeroVisual />

        <div class="landing-page__actions">
          <button
            type="button"
            class="landing-page__pill-btn landing-page__pill-btn--dark"
            @click="goToRegister"
          >
            {{ t('common.landing.cta') }}
          </button>
          <button
            type="button"
            class="landing-page__pill-btn landing-page__pill-btn--ghost"
            @click="goToLogin"
          >
            {{ t('common.landing.loginAction') }}
          </button>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import LandingHeroVisual from '@/components/common/LandingHeroVisual.vue'
import LandingTopBar from '@/components/common/LandingTopBar.vue'
import { useAppNavigation } from '@/composables/useAppNavigation'
import '@/styles/views/landing.css'

const { t } = useI18n()
const { goToRegister, goToLogin } = useAppNavigation()
</script>
