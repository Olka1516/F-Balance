<template>
  <main class="auth-page">
    <AuthSceneBackground />
    <section class="auth-page__card">
      <button
        type="button"
        class="auth-page__close"
        :aria-label="t('auth.close')"
        @click="goToLanding"
      >
        <span class="auth-page__close-icon" v-html="iconClose" />
      </button>
      <slot />
    </section>
  </main>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import iconClose from '@/assets/icons/close.svg?raw'
import AuthSceneBackground from '@/components/auth/AuthSceneBackground.vue'
import { useAppNavigation } from '@/composables/useAppNavigation'
import '@/styles/components/auth-page.css'

const { t } = useI18n()
const { goToLanding } = useAppNavigation()
</script>
