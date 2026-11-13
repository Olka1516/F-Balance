<template>
  <li class="saved-meal-card">
    <div class="saved-meal-card__head">
      <div class="saved-meal-card__heading">
        <p class="saved-meal-card__name">{{ meal.name }}</p>
        <p class="saved-meal-card__meta">
          {{
            t('meals.saved.macros', {
              calories: Math.round(meal.calories),
              protein: Math.round(meal.protein),
              fat: Math.round(meal.fat),
              carbs: Math.round(meal.carbs),
            })
          }}
        </p>
      </div>

      <button
        type="button"
        class="saved-meal-card__icon-button"
        :class="{ 'saved-meal-card__icon-button--star': meal.isFavorite }"
        :aria-pressed="meal.isFavorite"
        :aria-label="meal.isFavorite ? t('meals.saved.unfavorite') : t('meals.saved.favorite')"
        @click="emit('favorite')"
      >
        <span class="saved-meal-card__icon" aria-hidden="true" v-html="iconStar" />
      </button>

      <div v-if="!compact" ref="menuRoot" class="saved-meal-card__menu-root">
        <button
          type="button"
          class="saved-meal-card__icon-button"
          :aria-label="t('meals.saved.moreActions')"
          aria-haspopup="menu"
          :aria-expanded="menuOpen"
          :disabled="busy"
          @click="menuOpen = !menuOpen"
        >
          <span class="saved-meal-card__icon" aria-hidden="true" v-html="iconMore" />
        </button>
        <div v-if="menuOpen" class="saved-meal-card__menu" role="menu" @keydown.esc="menuOpen = false">
          <button type="button" role="menuitem" class="saved-meal-card__menu-item" @click="pick('edit')">
            {{ t('meals.myMeals.edit') }}
          </button>
          <button type="button" role="menuitem" class="saved-meal-card__menu-item" @click="pick('duplicate')">
            {{ t('meals.myMeals.duplicate') }}
          </button>
          <button
            type="button"
            role="menuitem"
            class="saved-meal-card__menu-item saved-meal-card__menu-item--danger"
            @click="pick('delete')"
          >
            {{ t('meals.myMeals.delete') }}
          </button>
        </div>
      </div>
    </div>

    <div class="saved-meal-card__foot">
      <span class="saved-meal-card__macros" role="img" :aria-label="macroAria">
        <span
          v-for="part in macroParts"
          :key="part.key"
          class="saved-meal-card__macro"
          :class="`saved-meal-card__macro--${part.key}`"
          :style="{ flexGrow: part.share }"
        />
      </span>
      <button
        type="button"
        class="saved-meal-card__add"
        :class="{ 'saved-meal-card__add--done': added }"
        :aria-label="added ? t('meals.saved.added', { meal: mealLabel }) : t('meals.saved.addTo', { meal: mealLabel })"
        :disabled="busy"
        @click="emit('add')"
      >
        <span class="saved-meal-card__icon" aria-hidden="true" v-html="added ? iconCheck : iconPlus" />
      </button>
    </div>
  </li>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { onClickOutside } from '@vueuse/core'
import { useI18n } from 'vue-i18n'
import iconCheck from '@/assets/icons/check.svg?raw'
import iconMore from '@/assets/icons/more.svg?raw'
import iconPlus from '@/assets/icons/plus.svg?raw'
import iconStar from '@/assets/icons/star.svg?raw'
import { MACRO_KCAL_CARBS, MACRO_KCAL_FAT, MACRO_KCAL_PROTEIN } from '@/constants/dashboard'
import type { MealWithIngredients } from '@/types'
import '@/styles/components/saved-meal-card.css'

const props = defineProps<{
  meal: MealWithIngredients
  mealLabel: string
  compact: boolean
  busy: boolean
  added: boolean
}>()

const emit = defineEmits<{
  add: []
  favorite: []
  edit: []
  duplicate: []
  delete: []
}>()

const { t } = useI18n()
const menuOpen = ref(false)
const menuRoot = ref<HTMLElement | null>(null)

onClickOutside(menuRoot, () => {
  menuOpen.value = false
})

const macroParts = computed(() => {
  const parts = [
    { key: 'protein', kcal: props.meal.protein * MACRO_KCAL_PROTEIN },
    { key: 'fat', kcal: props.meal.fat * MACRO_KCAL_FAT },
    { key: 'carbs', kcal: props.meal.carbs * MACRO_KCAL_CARBS },
  ]
  const total = parts.reduce((sum, part) => sum + part.kcal, 0)

  return parts.map((part) => ({ key: part.key, share: total > 0 ? part.kcal / total : 1 }))
})

const macroAria = computed(() =>
  t('meals.saved.macrosAria', {
    protein: Math.round(props.meal.protein),
    fat: Math.round(props.meal.fat),
    carbs: Math.round(props.meal.carbs),
  }),
)

function pick(action: 'edit' | 'duplicate' | 'delete'): void {
  menuOpen.value = false

  if (action === 'edit') {
    emit('edit')
  } else if (action === 'duplicate') {
    emit('duplicate')
  } else {
    emit('delete')
  }
}
</script>
