<template>
  <section class="app-empty-state">
    <h2 class="app-empty-state__title">{{ title }}</h2>
    <p v-if="message" class="app-empty-state__message">{{ message }}</p>
    <div v-if="$slots.default" class="app-empty-state__actions">
      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">
import '@/styles/components/app-empty-state.css'

defineProps<{
  title: string
  message?: string
}>()
</script>
