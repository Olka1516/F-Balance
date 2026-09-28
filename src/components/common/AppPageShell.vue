<template>
  <main class="app-page">
    <div class="app-page__atmosphere" aria-hidden="true">
      <div class="app-page__orb app-page__orb--primary" />
      <div class="app-page__orb app-page__orb--accent" />
      <div class="app-page__mesh" />
    </div>

    <div class="app-page__shell">
      <AppAuthNav />

      <section
        class="app-page__card"
        :class="{ 'app-page__card--wide': wide }"
      >
        <p class="app-page__season">
          {{ t(`common.seasons.${season}`) }}
        </p>

        <header class="app-page__header">
          <div class="app-page__heading">
            <h1 class="app-page__title">
              <slot name="title" />
            </h1>
            <p v-if="$slots.intro" class="app-page__intro">
              <slot name="intro" />
            </p>
          </div>
          <div v-if="$slots.actions" class="app-page__header-actions">
            <slot name="actions" />
          </div>
        </header>

        <slot />
      </section>
    </div>
  </main>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import AppAuthNav from '@/components/common/AppAuthNav.vue'
import { useThemeStore } from '@/stores/theme'
import '@/styles/components/app-page-shell.css'

withDefaults(
  defineProps<{
    wide?: boolean
  }>(),
  {
    wide: false,
  },
)

const { t } = useI18n()
const { season } = storeToRefs(useThemeStore())
</script>
