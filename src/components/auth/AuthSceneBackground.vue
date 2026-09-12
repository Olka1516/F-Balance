<template>
  <div class="auth-scene" aria-hidden="true">
    <div class="auth-scene__sky" />
    <div class="auth-scene__art" v-html="forestScene" />
    <div class="auth-scene__mist" />
  </div>
</template>

<script setup lang="ts">
import forestScene from '@/assets/auth/forest-scene.svg?raw'
import '@/styles/components/auth-scene-background.css'
</script>
