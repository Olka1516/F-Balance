<template>
  <main class="view-shell profile-page">
    <h1 class="view-shell__title">{{ t('common.profile.title') }}</h1>
    <p class="profile-page__intro">{{ t('common.profile.subtitle') }}</p>

    <div class="profile-page__language">
      <AppLanguageSwitch />
    </div>

    <AppLoader v-if="isProfileLoading" />

    <template v-else>
      <ProfileForm ref="profileFormRef" v-model="form" />

      <p
        v-if="formError"
        class="profile-page__message profile-page__message--error"
        role="alert"
      >
        {{ formError }}
      </p>
      <p
        v-if="formSuccess"
        class="profile-page__message profile-page__message--success"
        role="status"
      >
        {{ formSuccess }}
      </p>

      <div class="profile-page__actions">
        <AppButton
          type="button"
          :loading="isSaving"
          :disabled="isSaving || isLoggingOut"
          @click="onSave"
        >
          {{ isSaving ? t('common.profile.saving') : t('common.profile.save') }}
        </AppButton>
        <AppButton
          type="button"
          :variant="APP_BUTTON_VARIANT.secondary"
          :loading="isLoggingOut"
          :disabled="isSaving || isLoggingOut"
          @click="onLogout"
        >
          {{ isLoggingOut ? t('auth.loggingOut') : t('auth.logout') }}
        </AppButton>
      </div>
    </template>
  </main>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useQueryClient } from '@tanstack/vue-query'
import AppButton from '@/components/common/AppButton.vue'
import AppLanguageSwitch from '@/components/common/AppLanguageSwitch.vue'
import AppLoader from '@/components/common/AppLoader.vue'
import ProfileForm from '@/components/profile/ProfileForm.vue'
import { useAuth } from '@/composables/useAuth'
import { PROFILE_QUERY_KEY } from '@/constants/profile'
import { ROUTE_NAMES } from '@/constants/routes'
import { APP_BUTTON_VARIANT } from '@/constants/ui'
import { useProfileQuery, useUpsertProfileMutation } from '@/queries/profile'
import {
  createEmptyProfileForm,
  formValuesToProfileInput,
  profileToFormValues,
} from '@/utils/profileForm'
import { resolveProfileErrorI18nKey } from '@/utils/profileErrors'
import '@/styles/views/profile.css'

const { t } = useI18n()
const router = useRouter()
const queryClient = useQueryClient()
const { user, logout } = useAuth()
const userId = computed(() => user.value?.id)
const profileQuery = useProfileQuery(userId)
const upsertProfile = useUpsertProfileMutation()

const form = ref(createEmptyProfileForm())
const profileFormRef = ref<{ validate: () => Promise<boolean> } | null>(null)
const formError = ref('')
const formSuccess = ref('')
const isSaving = ref(false)
const isLoggingOut = ref(false)

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

async function onSave(): Promise<void> {
  formError.value = ''
  formSuccess.value = ''

  const valid = await profileFormRef.value?.validate()

  if (!valid) {
    return
  }

  const id = userId.value

  if (!id) {
    formError.value = t('auth.errors.unknown')
    return
  }

  isSaving.value = true

  try {
    await upsertProfile.mutateAsync({
      userId: id,
      input: formValuesToProfileInput(form.value, true),
    })
    formSuccess.value = t('common.profile.success')
  } catch (error) {
    formError.value = mapProfileErrorMessage(
      error instanceof Error ? error.message : 'unknown',
    )
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

function mapProfileErrorMessage(code: string): string {
  return t(resolveProfileErrorI18nKey(code))
}
</script>
