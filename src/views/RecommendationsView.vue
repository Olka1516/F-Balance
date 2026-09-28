<template>
  <AppPageShell>
    <template #title>
      {{ t('dashboard.recommendations.title') }}
    </template>
    <template #intro>
      {{ t('dashboard.recommendations.stub') }}
    </template>
  </AppPageShell>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import AppPageShell from '@/components/common/AppPageShell.vue'

const { t } = useI18n()
</script>
