<template>
  <article class="recommendation-card">
    <div class="recommendation-card__media">
      <img
        class="recommendation-card__image"
        :src="item.recipe.thumbUrl"
        :alt="item.recipe.name"
        loading="lazy"
        width="640"
        height="360"
      />
    </div>

    <div class="recommendation-card__body">
      <h3 class="recommendation-card__title">{{ item.recipe.name }}</h3>
      <p class="recommendation-card__meta">
        <span>
          {{
            t('recommendations.card.approxCalories', {
              value: item.approxCalories,
            })
          }}
        </span>
        <span aria-hidden="true">·</span>
        <span>
          {{
            t('recommendations.card.cookTime', {
              value: item.cookMinutes,
            })
          }}
        </span>
        <span aria-hidden="true">·</span>
        <span>{{ item.recipe.category }}</span>
      </p>
      <p class="recommendation-card__description">
        {{ item.shortDescription }}
      </p>
      <p class="recommendation-card__note">
        {{ t('recommendations.card.approxNote') }}
      </p>

      <AppButton
        type="button"
        :variant="APP_BUTTON_VARIANT.secondary"
        @click="expanded = !expanded"
      >
        {{
          expanded
            ? t('recommendations.card.closeDetails')
            : t('recommendations.card.openDetails')
        }}
      </AppButton>

      <div v-if="expanded" class="recommendation-card__details">
        <section class="recommendation-card__section">
          <h4 class="recommendation-card__section-title">
            {{ t('recommendations.card.ingredients') }}
          </h4>
          <ul class="recommendation-card__ingredients">
            <li
              v-for="(ingredient, index) in item.recipe.ingredients"
              :key="`${ingredient.name}-${index}`"
            >
              <span v-if="ingredient.measure">{{ ingredient.measure }} </span>
              {{ ingredient.name }}
            </li>
          </ul>
        </section>

        <section class="recommendation-card__section">
          <h4 class="recommendation-card__section-title">
            {{ t('recommendations.card.recipe') }}
          </h4>
          <p class="recommendation-card__instructions">
            {{ item.recipe.instructions }}
          </p>
        </section>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import AppButton from '@/components/common/AppButton.vue'
import { APP_BUTTON_VARIANT } from '@/constants/ui'
import type { RecipeRecommendation } from '@/types'
import '@/styles/components/recommendation-card.css'

defineProps<{
  item: RecipeRecommendation
}>()

const { t } = useI18n()
const expanded = ref(false)
</script>
