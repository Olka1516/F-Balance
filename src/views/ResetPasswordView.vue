<template>
  <AuthPageShell>
    <h1 class="auth-page__title">{{ t('auth.resetPassword.title') }}</h1>

    <form
      v-if="isRecoveryMode"
      class="auth-page__form"
      @submit.prevent="onUpdatePassword"
    >
      <AppInput
        v-model="updateForm.password"
        :label="t('auth.fields.password')"
        :type="APP_INPUT_TYPE.password"
        :autocomplete="AUTH_AUTOCOMPLETE.newPassword"
        :variant="APP_INPUT_VARIANT.underline"
        :icon="APP_INPUT_ICON.password"
        :error="getDirtyFieldError(updateRegle.password)"
      />
      <AppInput
        v-model="updateForm.confirmPassword"
        :label="t('auth.fields.confirmPassword')"
        :type="APP_INPUT_TYPE.password"
        :autocomplete="AUTH_AUTOCOMPLETE.newPassword"
        :variant="APP_INPUT_VARIANT.underline"
        :icon="APP_INPUT_ICON.password"
        :error="getDirtyFieldError(updateRegle.confirmPassword)"
      />

      <p
        v-if="formError"
        class="auth-page__message auth-page__message--error"
        role="alert"
      >
        {{ formError }}
      </p>
      <p
        v-if="formSuccess"
        class="auth-page__message auth-page__message--success"
        role="status"
      >
        {{ formSuccess }}
      </p>

      <div class="auth-page__actions auth-page__submit">
        <AppButton type="submit" :loading="isSubmitting" :disabled="isSubmitting">
          {{ t('auth.resetPassword.submitUpdate') }}
        </AppButton>
      </div>
    </form>

    <form v-else class="auth-page__form" @submit.prevent="onRequestReset">
      <AppInput
        v-model="requestForm.email"
        :label="t('auth.fields.email')"
        :type="APP_INPUT_TYPE.email"
        :autocomplete="AUTH_AUTOCOMPLETE.email"
        :variant="APP_INPUT_VARIANT.underline"
        :icon="APP_INPUT_ICON.email"
        :error="getDirtyFieldError(requestRegle.email)"
      />

      <p
        v-if="formError"
        class="auth-page__message auth-page__message--error"
        role="alert"
      >
        {{ formError }}
      </p>
      <p
        v-if="formSuccess"
        class="auth-page__message auth-page__message--success"
        role="status"
      >
        {{ formSuccess }}
      </p>

      <div class="auth-page__actions auth-page__submit">
        <AppButton type="submit" :loading="isSubmitting" :disabled="isSubmitting">
          {{ t('auth.resetPassword.submitRequest') }}
        </AppButton>
      </div>
    </form>

    <p class="auth-page__footer">
      <button type="button" class="auth-page__link auth-page__link--emphasis" @click="goToLogin">
        {{ t('auth.resetPassword.backToLogin') }}
      </button>
    </p>
  </AuthPageShell>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useRegle } from '@regle/core'
import { email, minLength, required, sameAs, withMessage } from '@regle/rules'
import AuthPageShell from '@/components/auth/AuthPageShell.vue'
import AppButton from '@/components/common/AppButton.vue'
import AppInput from '@/components/common/AppInput.vue'
import { useAppNavigation } from '@/composables/useAppNavigation'
import { useAuth } from '@/composables/useAuth'
import {
  AUTH_AUTOCOMPLETE,
  AUTH_PASSWORD_MIN_LENGTH,
} from '@/constants/auth'
import { ROUTE_NAMES } from '@/constants/routes'
import {
  APP_INPUT_ICON,
  APP_INPUT_TYPE,
  APP_INPUT_VARIANT,
} from '@/constants/ui'
import { getSupabaseReadiness } from '@/services/supabase'
import { getDirtyFieldError } from '@/utils/formErrors'
import '@/styles/views/reset-password.css'

const { t } = useI18n()
const router = useRouter()
const { goToLogin } = useAppNavigation()
const { resetPassword, setNewPassword } = useAuth()

const isRecoveryMode = ref(false)
const formError = ref('')
const formSuccess = ref('')
const isSubmitting = ref(false)

const requestForm = ref({
  email: '',
})

const updateForm = ref({
  password: '',
  confirmPassword: '',
})

const { r$: requestRegle } = useRegle(requestForm, {
  email: {
    required: withMessage(required, () => t('auth.validation.required')),
    email: withMessage(email, () => t('auth.validation.email')),
  },
})

const { r$: updateRegle } = useRegle(updateForm, {
  password: {
    required: withMessage(required, () => t('auth.validation.required')),
    minLength: withMessage(minLength(AUTH_PASSWORD_MIN_LENGTH), () =>
      t('auth.validation.minPassword', { min: AUTH_PASSWORD_MIN_LENGTH }),
    ),
  },
  confirmPassword: {
    required: withMessage(required, () => t('auth.validation.required')),
    sameAs: withMessage(sameAs(() => updateForm.value.password), () =>
      t('auth.validation.passwordMismatch'),
    ),
  },
})

onMounted(() => {
  const hash = window.location.hash
  isRecoveryMode.value =
    hash.includes('type=recovery') || hash.includes('type=invite')
})

async function onRequestReset(): Promise<void> {
  formError.value = ''
  formSuccess.value = ''

  const { valid } = await requestRegle.$validate()

  if (!valid) {
    return
  }

  const readiness = getSupabaseReadiness()

  if (!readiness.ready) {
    formError.value = t(`auth.errors.${readiness.code}`)
    return
  }

  isSubmitting.value = true

  try {
    const result = await resetPassword(requestForm.value.email)

    if (!result.ok) {
      formError.value = t(`auth.errors.${result.code}`)
      return
    }

    formSuccess.value = t('auth.resetPassword.requestSuccess')
  } finally {
    isSubmitting.value = false
  }
}

async function onUpdatePassword(): Promise<void> {
  formError.value = ''
  formSuccess.value = ''

  const { valid } = await updateRegle.$validate()

  if (!valid) {
    return
  }

  const readiness = getSupabaseReadiness()

  if (!readiness.ready) {
    formError.value = t(`auth.errors.${readiness.code}`)
    return
  }

  isSubmitting.value = true

  try {
    const result = await setNewPassword(updateForm.value.password)

    if (!result.ok) {
      formError.value = t(`auth.errors.${result.code}`)
      return
    }

    formSuccess.value = t('auth.resetPassword.updateSuccess')
    await router.push({ name: ROUTE_NAMES.login })
  } finally {
    isSubmitting.value = false
  }
}
</script>
