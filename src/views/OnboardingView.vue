<template>
  <main class="view-shell">
    <h1 class="view-shell__title">{{ t("auth.onboarding.title") }}</h1>
  </main>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";

const { t } = useI18n();
</script>
