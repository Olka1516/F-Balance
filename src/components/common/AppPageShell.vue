<template>
  <main class="app-page" :class="{ 'app-page--with-nav': showNav }">
    <AppNav v-if="showNav" />

    <div class="app-page__shell">
      <section
        class="app-page__card"
        :class="{ 'app-page__card--wide': wide }"
      >
        <header class="app-page__header">
          <div class="app-page__heading-row">
            <h1 class="app-page__title">
              <slot name="title" />
            </h1>
          </div>
          <p v-if="$slots.intro" class="app-page__intro">
            <slot name="intro" />
          </p>
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
import AppNav from '@/components/common/AppNav.vue'
import '@/styles/components/app-page-shell.css'

withDefaults(
  defineProps<{
    wide?: boolean
    showNav?: boolean
  }>(),
  {
    wide: false,
    showNav: true,
  },
)
</script>
