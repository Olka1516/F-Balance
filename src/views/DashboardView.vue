<template>
  <main class="view-shell">
    <AppAuthNav />
    <h1 class="view-shell__title">{{ t('dashboard.title') }}</h1>
  </main>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import AppAuthNav from '@/components/common/AppAuthNav.vue'

const { t } = useI18n()
</script>
