<template>
  <router-view />
</template>

<script setup lang="ts">
import { onMounted, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useAuth } from "@/composables/useAuth";
import { useSupabaseConnection } from "@/composables/useSupabaseConnection";
import { useThemeStore } from "@/stores/theme";
import "@/styles/base.css";

const themeStore = useThemeStore();
const { locale } = useI18n();
const { connect } = useSupabaseConnection();
const { initAuth } = useAuth();

onMounted(async () => {
  await connect();
  await initAuth();
});

themeStore.init();

watch(
  locale,
  (value) => {
    document.documentElement.lang = value;
  },
  { immediate: true },
);
</script>
