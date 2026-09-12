<template>
  <main class="view-shell">
    <h1 class="view-shell__title">{{ t("auth.register.title") }}</h1>
  </main>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";

const { t } = useI18n();
</script>
