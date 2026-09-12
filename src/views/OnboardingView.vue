<template>
  <main class="onboarding-page">
    <div class="onboarding-page__atmosphere" aria-hidden="true">
      <div class="onboarding-page__orb onboarding-page__orb--primary" />
      <div class="onboarding-page__orb onboarding-page__orb--accent" />
      <div class="onboarding-page__mesh" />
    </div>

    <section class="onboarding-page__card">
      <p class="onboarding-page__season">
        {{ t(`common.seasons.${season}`) }}
      </p>
      <h1 class="onboarding-page__title">{{ t('auth.onboarding.title') }}</h1>
      <p class="onboarding-page__intro">{{ t('auth.onboarding.subtitle') }}</p>

      <ol class="onboarding-page__steps" aria-hidden="true">
        <li class="onboarding-page__step onboarding-page__step--active">
          {{ t('auth.onboarding.steps.profile') }}
        </li>
        <li class="onboarding-page__step">
          {{ t('auth.onboarding.steps.dashboard') }}
        </li>
      </ol>

      <AppLoader v-if="isProfileLoading" />

      <template v-else>
        <ProfileForm
          ref="profileFormRef"
          v-model="form"
          :variant="PROFILE_FORM_VARIANT.onboarding"
        />

        <p
          v-if="formError"
          class="onboarding-page__message onboarding-page__message--error"
          role="alert"
        >
          {{ formError }}
        </p>

        <div class="onboarding-page__actions">
          <AppButton
            type="button"
            :loading="isSaving"
            :disabled="isSaving || isSkipping"
            @click="onContinue"
          >
            {{ t('auth.onboarding.submit') }}
          </AppButton>
          <button
            type="button"
            class="onboarding-page__skip"
            :disabled="isSaving || isSkipping"
            @click="onSkip"
          >
            {{
              isSkipping
                ? t('common.loading')
                : t('auth.onboarding.skip')
            }}
          </button>
        </div>
      </template>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import AppButton from '@/components/common/AppButton.vue'
import AppLoader from '@/components/common/AppLoader.vue'
import ProfileForm from '@/components/profile/ProfileForm.vue'
import { useAuth } from '@/composables/useAuth'
import { PROFILE_FORM_VARIANT } from '@/constants/profile'
import { ROUTE_NAMES } from '@/constants/routes'
import { useProfileQuery, useUpsertProfileMutation } from '@/queries/profile'
import { useThemeStore } from '@/stores/theme'
import { resolveProfileErrorI18nKey } from '@/utils/profileErrors'
import {
  createEmptyProfileForm,
  formValuesToProfileInput,
  profileToFormValues,
} from '@/utils/profileForm'
import '@/styles/views/onboarding.css'

const { t } = useI18n()
const router = useRouter()
const { user } = useAuth()
const { season } = storeToRefs(useThemeStore())
const userId = computed(() => user.value?.id)
const profileQuery = useProfileQuery(userId)
const upsertProfile = useUpsertProfileMutation()

const form = ref(createEmptyProfileForm())
const profileFormRef = ref<{ validate: () => Promise<boolean> } | null>(null)
const formError = ref('')
const isSaving = ref(false)
const isSkipping = ref(false)

const isProfileLoading = computed(
  () => profileQuery.isPending.value && !profileQuery.isFetched.value,
)

watch(
  () => profileQuery.data.value,
  (profile) => {
    form.value = profileToFormValues(profile ?? null)
  },
  { immediate: true },
)

watch(
  () => profileQuery.error.value,
  (error) => {
    if (!error) {
      return
    }

    formError.value = mapProfileErrorMessage(String(error.message))
  },
)

async function onContinue(): Promise<void> {
  formError.value = ''

  const valid = await profileFormRef.value?.validate()

  if (!valid) {
    return
  }

  await saveProfile(true, false)
}

async function onSkip(): Promise<void> {
  formError.value = ''
  await saveProfile(true, true)
}

async function saveProfile(
  onboardingCompleted: boolean,
  isSkip: boolean,
): Promise<void> {
  const id = userId.value

  if (!id) {
    formError.value = t('auth.errors.unknown')
    return
  }

  if (isSkip) {
    isSkipping.value = true
  } else {
    isSaving.value = true
  }

  try {
    await upsertProfile.mutateAsync({
      userId: id,
      input: formValuesToProfileInput(
        isSkip ? createEmptyProfileForm() : form.value,
        onboardingCompleted,
      ),
    })

    await router.push({ name: ROUTE_NAMES.dashboard })
  } catch (error) {
    formError.value = mapProfileErrorMessage(
      error instanceof Error ? error.message : 'unknown',
    )
  } finally {
    isSaving.value = false
    isSkipping.value = false
  }
}

function mapProfileErrorMessage(code: string): string {
  return t(resolveProfileErrorI18nKey(code))
}
</script>
