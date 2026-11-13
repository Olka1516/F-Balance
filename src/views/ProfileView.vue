<template>
  <AppPageShell bare>
    <div class="profile-page" :class="{ 'profile-page--dirty': isDirty }">
      <header class="profile-page__header">
        <span class="profile-page__avatar" aria-hidden="true">{{ avatarLetter }}</span>
        <div class="profile-page__heading">
          <h1 class="profile-page__title">{{ t('common.profile.title') }}</h1>
          <p v-if="email" class="profile-page__email">{{ email }}</p>
        </div>
      </header>

      <AppLoader v-if="isProfileLoading" />

      <template v-else>
        <section class="profile-page__norm" :aria-label="t('common.profile.calc.title')">
          <p class="profile-page__norm-label">{{ t('common.profile.calc.title') }}</p>
          <p class="profile-page__norm-value">
            {{ form.dailyCalories || '—' }}
            <span class="profile-page__norm-unit">{{ t('dashboard.summary.kcal') }}</span>
          </p>
          <ul class="profile-page__norm-macros">
            <li v-for="macro in normMacros" :key="macro.key" class="profile-page__norm-macro">
              <span>{{ macro.label }}</span>
              <strong>{{ macro.value }}</strong>
            </li>
          </ul>
          <p v-if="!targets && targetMode === 'auto'" class="profile-page__norm-hint">
            {{ t('common.profile.calc.missing') }}
          </p>
        </section>

        <section class="profile-page__group" aria-labelledby="profile-goal">
          <h2 id="profile-goal" class="profile-page__group-title">{{ t('common.profile.sections.goal') }}</h2>
          <div class="profile-page__card profile-page__card--padded">
            <AppSegmented v-model="form.goal" :options="goalOptions" :label="t('common.profile.sections.goal')" />
            <template v-if="changesWeight">
              <div class="profile-page__row">
                <span class="profile-page__row-label">{{ t('common.profile.sections.pace') }}</span>
                <AppSegmented
                  v-model="form.pace"
                  class="profile-page__pace"
                  :options="paceOptions"
                  :label="t('common.profile.sections.pace')"
                />
              </div>
              <ProfileStepper
                v-model="form.targetWeight"
                :label="t('common.profile.fields.targetWeightShort')"
                :unit="t('common.profile.units.kg')"
                :step="PROFILE_STEPPERS.targetWeight.step"
                :start="PROFILE_STEPPERS.targetWeight.start"
                :min="PROFILE_WEIGHT_MIN_KG"
                :max="PROFILE_WEIGHT_MAX_KG"
                :error="fieldErrors.targetWeight"
              />
            </template>
          </div>
        </section>

        <section class="profile-page__group" aria-labelledby="profile-body">
          <h2 id="profile-body" class="profile-page__group-title">{{ t('common.profile.sections.body') }}</h2>
          <div class="profile-page__card">
            <ProfileStepper
              v-model="form.weight"
              :label="t('common.profile.fields.weightShort')"
              :unit="t('common.profile.units.kg')"
              :step="PROFILE_STEPPERS.weight.step"
              :start="PROFILE_STEPPERS.weight.start"
              :min="PROFILE_WEIGHT_MIN_KG"
              :max="PROFILE_WEIGHT_MAX_KG"
              :error="fieldErrors.weight"
            />
            <ProfileStepper
              v-model="form.height"
              :label="t('common.profile.fields.heightShort')"
              :unit="t('common.profile.units.cm')"
              :step="PROFILE_STEPPERS.height.step"
              :start="PROFILE_STEPPERS.height.start"
              :min="PROFILE_HEIGHT_MIN_CM"
              :max="PROFILE_HEIGHT_MAX_CM"
              :error="fieldErrors.height"
            />
            <ProfileStepper
              v-model="form.age"
              :label="t('common.profile.fields.age')"
              :unit="t('common.profile.units.years')"
              :step="PROFILE_STEPPERS.age.step"
              :start="PROFILE_STEPPERS.age.start"
              :min="PROFILE_AGE_MIN"
              :max="PROFILE_AGE_MAX"
              :error="fieldErrors.age"
            />
            <div class="profile-page__row profile-page__row--bordered">
              <span class="profile-page__row-label">{{ t('common.profile.sections.sex') }}</span>
              <AppSegmented
                v-model="form.sex"
                class="profile-page__sex"
                :options="sexOptions"
                :label="t('common.profile.sections.sex')"
              />
            </div>
          </div>
        </section>

        <section class="profile-page__group" aria-labelledby="profile-activity">
          <h2 id="profile-activity" class="profile-page__group-title">{{ t('common.profile.sections.activity') }}</h2>
          <div class="profile-page__card profile-page__activity" role="radiogroup" aria-labelledby="profile-activity">
            <button
              v-for="option in activityOptions"
              :key="option.value"
              type="button"
              role="radio"
              class="profile-page__activity-option"
              :class="{ 'profile-page__activity-option--active': form.activityLevel === option.value }"
              :aria-checked="form.activityLevel === option.value"
              @click="form.activityLevel = option.value"
            >
              <span class="profile-page__activity-text">
                <span class="profile-page__activity-label">{{ option.label }}</span>
                <span class="profile-page__activity-hint">{{ option.hint }}</span>
              </span>
              <span class="profile-page__radio" aria-hidden="true" />
            </button>
          </div>
        </section>

        <section class="profile-page__group" aria-labelledby="profile-targets">
          <h2 id="profile-targets" class="profile-page__group-title">{{ t('common.profile.sections.target') }}</h2>
          <div class="profile-page__card profile-page__card--padded">
            <AppSegmented
              :model-value="targetMode"
              :options="targetModeOptions"
              :label="t('common.profile.sections.target')"
              @update:model-value="setTargetMode"
            />
            <div v-if="targetMode === 'manual'" class="profile-page__manual">
              <AppInput
                v-for="field in manualFields"
                :key="field"
                v-model="form[field]"
                :label="t(`common.profile.fields.${field}`)"
                :type="APP_INPUT_TYPE.number"
                :error="fieldErrors[field]"
              />
              <p class="profile-page__hint">{{ t('common.profile.macrosHint') }}</p>
            </div>
          </div>
        </section>

        <section class="profile-page__group" aria-labelledby="profile-settings">
          <h2 id="profile-settings" class="profile-page__group-title">{{ t('common.profile.sections.settings') }}</h2>
          <div class="profile-page__card">
            <div class="profile-page__row">
              <span class="profile-page__row-label">{{ t('common.language.label') }}</span>
              <AppLanguageSwitch />
            </div>
          </div>
        </section>

        <p v-if="formError" class="app-page__message app-page__message--error" role="alert">{{ formError }}</p>
        <p v-if="formSuccess" class="app-page__message app-page__message--success" role="status">{{ formSuccess }}</p>

        <button
          type="button"
          class="profile-page__logout"
          :disabled="isSaving || isLoggingOut"
          @click="onLogout"
        >
          {{ isLoggingOut ? t('auth.loggingOut') : t('auth.logout') }}
        </button>
      </template>

      <div v-if="isDirty" class="profile-page__savebar" role="region" :aria-label="t('common.profile.unsaved')">
        <span class="profile-page__savebar-text">{{ t('common.profile.unsaved') }}</span>
        <button type="button" class="profile-page__savebar-cancel" :disabled="isSaving" @click="resetChanges">
          {{ t('common.profile.discard') }}
        </button>
        <button type="button" class="profile-page__savebar-save" :disabled="isSaving" @click="onSave">
          {{ isSaving ? t('common.profile.saving') : t('common.profile.save') }}
        </button>
      </div>
    </div>
  </AppPageShell>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useQueryClient } from '@tanstack/vue-query'
import AppInput from '@/components/common/AppInput.vue'
import AppLanguageSwitch from '@/components/common/AppLanguageSwitch.vue'
import AppLoader from '@/components/common/AppLoader.vue'
import AppPageShell from '@/components/common/AppPageShell.vue'
import AppSegmented from '@/components/common/AppSegmented.vue'
import ProfileStepper from '@/components/profile/ProfileStepper.vue'
import { useAuth } from '@/composables/useAuth'
import { useProfileForm } from '@/composables/useProfileForm'
import {
  PROFILE_AGE_MAX,
  PROFILE_AGE_MIN,
  PROFILE_HEIGHT_MAX_CM,
  PROFILE_HEIGHT_MIN_CM,
  PROFILE_QUERY_KEY,
  PROFILE_STEPPERS,
  PROFILE_TARGET_MODES,
  PROFILE_WEIGHT_MAX_KG,
  PROFILE_WEIGHT_MIN_KG,
  type ProfileTargetMode,
} from '@/constants/profile'
import { ROUTE_NAMES } from '@/constants/routes'
import { APP_INPUT_TYPE } from '@/constants/ui'
import { useProfileQuery, useUpsertProfileMutation } from '@/queries/profile'
import { resolveProfileErrorI18nKey } from '@/utils/profileErrors'
import {
  createEmptyProfileForm,
  formValuesToProfileInput,
  profileToFormValues,
} from '@/utils/profileForm'
import '@/styles/views/profile.css'

const { t } = useI18n()
const router = useRouter()
const queryClient = useQueryClient()
const { user, logout } = useAuth()
const userId = computed(() => user.value?.id)
const profileQuery = useProfileQuery(userId)
const upsertProfile = useUpsertProfileMutation()

const form = ref(createEmptyProfileForm())
const savedSnapshot = ref(JSON.stringify(form.value))
const autoApply = ref(true)
const formError = ref('')
const formSuccess = ref('')
const isSaving = ref(false)
const isLoggingOut = ref(false)

const manualFields = ['dailyCalories', 'dailyProtein', 'dailyFat', 'dailyCarbs'] as const

const {
  fieldErrors,
  goalOptions,
  activityOptions,
  sexOptions,
  paceOptions,
  changesWeight,
  targets,
  isTargetsApplied,
  hasNoTargets,
  applyTargets,
  validate,
} = useProfileForm(form, { autoApply })

const email = computed(() => user.value?.email ?? '')
const avatarLetter = computed(() => (email.value.charAt(0) || t('common.profile.title').charAt(0)).toUpperCase())
const isProfileLoading = computed(() => profileQuery.isPending.value && !profileQuery.isFetched.value)
const isDirty = computed(() => JSON.stringify(form.value) !== savedSnapshot.value)
const targetMode = computed<ProfileTargetMode>(() => (autoApply.value ? 'auto' : 'manual'))

const targetModeOptions = computed(() =>
  PROFILE_TARGET_MODES.map((value) => ({ value, label: t(`common.profile.targetModes.${value}`) })),
)

const normMacros = computed(() => [
  { key: 'protein', label: t('dashboard.macros.protein'), value: gramsOrDash(form.value.dailyProtein) },
  { key: 'fat', label: t('dashboard.macros.fat'), value: gramsOrDash(form.value.dailyFat) },
  { key: 'carbs', label: t('dashboard.macros.carbs'), value: gramsOrDash(form.value.dailyCarbs) },
])

watch(
  () => profileQuery.data.value,
  (profile) => {
    form.value = profileToFormValues(profile ?? null)
    savedSnapshot.value = JSON.stringify(form.value)
    autoApply.value = hasNoTargets.value || isTargetsApplied.value
  },
  { immediate: true },
)

watch(
  () => profileQuery.error.value,
  (error) => {
    if (error) {
      formError.value = t(resolveProfileErrorI18nKey(String(error.message)))
    }
  },
)

watch(isDirty, (dirty) => {
  if (dirty) {
    formSuccess.value = ''
  }
})

function gramsOrDash(value: string): string {
  return value.trim() ? t('dashboard.macros.grams', { value }) : '—'
}

function setTargetMode(mode: string): void {
  autoApply.value = mode === 'auto'

  if (autoApply.value) {
    applyTargets()
  }
}

function resetChanges(): void {
  form.value = JSON.parse(savedSnapshot.value)
  autoApply.value = hasNoTargets.value || isTargetsApplied.value
  formError.value = ''
}

async function onSave(): Promise<void> {
  formError.value = ''
  formSuccess.value = ''

  if (!(await validate())) {
    return
  }

  const id = userId.value

  if (!id) {
    formError.value = t('auth.errors.unknown')
    return
  }

  isSaving.value = true

  try {
    await upsertProfile.mutateAsync({ userId: id, input: formValuesToProfileInput(form.value, true) })
    savedSnapshot.value = JSON.stringify(form.value)
    formSuccess.value = t('common.profile.success')
  } catch (error) {
    formError.value = t(resolveProfileErrorI18nKey(error instanceof Error ? error.message : 'unknown'))
  } finally {
    isSaving.value = false
  }
}

async function onLogout(): Promise<void> {
  formError.value = ''
  isLoggingOut.value = true

  try {
    const result = await logout()

    if (!result.ok) {
      formError.value = t(`auth.errors.${result.code}`)
      return
    }

    queryClient.removeQueries({ queryKey: PROFILE_QUERY_KEY })
    await router.push({ name: ROUTE_NAMES.landing })
  } finally {
    isLoggingOut.value = false
  }
}
</script>
