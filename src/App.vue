<template>
  <router-view />
</template>

<script setup lang="ts">
import { watch } from "vue";
import { useI18n } from "vue-i18n";
import { useThemeStore } from "@/stores/theme";
import "./styles/base.css";

const themeStore = useThemeStore();
const { locale } = useI18n();

themeStore.init();

watch(
  locale,
  (value) => {
    document.documentElement.lang = value;
  },
  { immediate: true },
);
</script>
