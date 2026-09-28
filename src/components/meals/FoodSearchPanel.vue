<template>
  <div class="food-search-panel">
    <AppInput
      v-model="searchInput"
      :label="t('meals.search.queryLabel')"
      :type="APP_INPUT_TYPE.text"
      :placeholder="t('meals.search.placeholder')"
    />

    <p class="food-search-panel__hint">
      {{
        t('meals.search.hint', {
          min: OPEN_FOOD_FACTS_SEARCH_MIN_CHARS,
        })
      }}
    </p>

    <AppLoader v-if="showLoader" />

    <p
      v-else-if="errorMessage"
      class="app-page__message app-page__message--error"
      role="alert"
    >
      {{ errorMessage }}
    </p>

    <AppEmptyState
      v-else-if="showEmpty"
      :title="t('meals.search.emptyTitle')"
      :message="t('meals.search.emptyMessage')"
    />

    <ul v-else-if="hits.length > 0" class="food-search-panel__list">
      <li v-for="hit in hits" :key="hit.id" class="food-search-panel__item">
        <button
          type="button"
          class="food-search-panel__pick"
          @click="emit('select', hit)"
        >
          <span class="food-search-panel__name">
            {{ formatFoodSearchLabel(hit) }}
          </span>
          <span class="food-search-panel__macros">
            {{
              hit.isComplete
                ? t('meals.search.macros', {
                    calories: hit.caloriesPer100g,
                    protein: hit.proteinPer100g,
                    fat: hit.fatPer100g,
                    carbs: hit.carbsPer100g,
                  })
                : t('meals.search.incomplete')
            }}
          </span>
        </button>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { refDebounced } from '@vueuse/core'
import AppEmptyState from '@/components/common/AppEmptyState.vue'
import AppInput from '@/components/common/AppInput.vue'
import AppLoader from '@/components/common/AppLoader.vue'
import {
  OPEN_FOOD_FACTS_SEARCH_DEBOUNCE_MS,
  OPEN_FOOD_FACTS_SEARCH_MIN_CHARS,
} from '@/constants/api'
import { APP_INPUT_TYPE } from '@/constants/ui'
import { useFoodSearchQuery } from '@/queries/foodSearch'
import type { FoodSearchHit } from '@/types'
import { formatFoodSearchLabel } from '@/utils/openFoodFacts'
import '@/styles/components/food-search-panel.css'

const emit = defineEmits<{
  select: [hit: FoodSearchHit]
}>()

const { t } = useI18n()
const searchInput = ref('')
const debouncedSearch = refDebounced(
  searchInput,
  OPEN_FOOD_FACTS_SEARCH_DEBOUNCE_MS,
)

const searchQuery = useFoodSearchQuery(debouncedSearch)

const hits = computed(() => searchQuery.data.value ?? [])
const canSearch = computed(
  () => debouncedSearch.value.trim().length >= OPEN_FOOD_FACTS_SEARCH_MIN_CHARS,
)
const showLoader = computed(
  () => canSearch.value && searchQuery.isFetching.value,
)
const showEmpty = computed(
  () =>
    canSearch.value &&
    searchQuery.isFetched.value &&
    !searchQuery.isFetching.value &&
    !searchQuery.error.value &&
    hits.value.length === 0,
)

const errorMessage = computed(() => {
  const error = searchQuery.error.value

  if (!error || !canSearch.value) {
    return ''
  }

  const code = String(error.message)

  if (code === 'rateLimited') {
    return t('meals.search.errors.rateLimited')
  }

  if (code === 'unavailable') {
    return t('meals.search.errors.unavailable')
  }

  return t('meals.search.errors.unknown')
})
</script>
