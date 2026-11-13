<template>
  <section class="dashboard-macros" :aria-label="t('dashboard.macros.aria')">
    <div
      v-for="macro in macros"
      :key="macro.key"
      class="dashboard-macros__item"
      :class="{ 'dashboard-macros__item--over': macro.isOver }"
    >
      <span class="dashboard-macros__name">{{ macro.label }}</span>
      <span class="dashboard-macros__track" aria-hidden="true">
        <span
          class="dashboard-macros__fill"
          :class="`dashboard-macros__fill--${macro.key}`"
          :style="{ width: `${macro.percent}%` }"
        />
      </span>
      <span class="dashboard-macros__value">{{ macro.valueText }}</span>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import '@/styles/components/dashboard-macros.css'

type MacroKey = 'protein' | 'fat' | 'carbs'

const props = defineProps<{
  consumed: Record<MacroKey, number>
  targets: Record<MacroKey, number | null>
}>()

const { t } = useI18n()
const MACRO_ORDER: MacroKey[] = ['carbs', 'protein', 'fat']
const FULL_PERCENT = 100

const macros = computed(() =>
  MACRO_ORDER.map((key) => {
    const value = Math.round(props.consumed[key])
    const target = props.targets[key]
    const hasTarget = target != null && target > 0
    const percent = hasTarget
      ? Math.min(FULL_PERCENT, Math.round((value / target) * FULL_PERCENT))
      : value > 0
        ? FULL_PERCENT
        : 0

    return {
      key,
      label: t(`dashboard.macros.${key}`),
      percent,
      isOver: hasTarget && value > target,
      valueText: hasTarget
        ? t('dashboard.macros.ofTarget', { value, target: Math.round(target) })
        : t('dashboard.macros.grams', { value }),
    }
  }),
)
</script>
