<template>
  <main class="view-shell">
    <h1 class="view-shell__title">
      {{ t("dashboard.recommendations.title") }}
    </h1>
    <p class="view-shell__message">{{ t("dashboard.recommendations.stub") }}</p>
  </main>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";

const { t } = useI18n();
</script>
