<template>
  <div class="landing-hero-visual">
    <div class="landing-hero-visual__center">
      <div
        class="landing-hero-visual__disc landing-hero-visual__disc--back"
        aria-hidden="true"
      />
      <div
        class="landing-hero-visual__disc landing-hero-visual__disc--front"
        aria-hidden="true"
      >
        <p class="landing-hero-visual__hero-word">
          {{ t('common.landing.centerWord') }}
        </p>
        <p class="landing-hero-visual__hero-sub">
          {{ t('common.landing.centerSub') }}
        </p>
        <p class="landing-hero-visual__hero-tag">
          {{ t('common.landing.centerTag') }}
        </p>
      </div>
    </div>

    <aside class="landing-hero-visual__aside" aria-hidden="true">
      <div class="landing-hero-visual__ring-wrap">
        <div class="landing-hero-visual__ring">
          <svg
            class="landing-hero-visual__ring-svg"
            :viewBox="`0 0 ${LANDING_RING_VIEWBOX_SIZE} ${LANDING_RING_VIEWBOX_SIZE}`"
          >
            <circle
              class="landing-hero-visual__ring-track"
              :cx="LANDING_RING_CENTER"
              :cy="LANDING_RING_CENTER"
              :r="LANDING_RING_RADIUS"
              fill="none"
              :stroke-width="LANDING_RING_STROKE_WIDTH"
            />
            <circle
              class="landing-hero-visual__ring-progress"
              :cx="LANDING_RING_CENTER"
              :cy="LANDING_RING_CENTER"
              :r="LANDING_RING_RADIUS"
              fill="none"
              :stroke-width="LANDING_RING_STROKE_WIDTH"
              :stroke-dasharray="LANDING_RING_CIRCUMFERENCE"
              :stroke-dashoffset="ringProgressOffset"
              :transform="`rotate(-90 ${LANDING_RING_CENTER} ${LANDING_RING_CENTER})`"
            />
          </svg>
          <div class="landing-hero-visual__ring-label">
            <span class="landing-hero-visual__ring-value">{{
              LANDING_PREVIEW.calories
            }}</span>
            <span class="landing-hero-visual__ring-unit">{{
              t('common.landing.preview.kcal')
            }}</span>
          </div>
        </div>
        <div
          class="landing-hero-visual__float landing-hero-visual__float--protein"
        >
          {{ LANDING_PREVIEW.protein }}g
          {{ t('common.landing.preview.protein') }}
        </div>
        <div
          class="landing-hero-visual__float landing-hero-visual__float--carbs"
        >
          {{ LANDING_PREVIEW.carbs }}g {{ t('common.landing.preview.carbs') }}
        </div>
      </div>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  LANDING_PREVIEW,
  LANDING_RING_CENTER,
  LANDING_RING_CIRCUMFERENCE,
  LANDING_RING_RADIUS,
  LANDING_RING_STROKE_WIDTH,
  LANDING_RING_VIEWBOX_SIZE,
} from '@/constants/landing'
import '@/styles/components/landing-hero-visual.css'

const { t } = useI18n()

const ringProgressOffset = computed(
  () => LANDING_RING_CIRCUMFERENCE * (1 - LANDING_PREVIEW.progressPercent / 100),
)
</script>
