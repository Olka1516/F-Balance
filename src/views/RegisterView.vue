<template>
  <AuthPageShell>
    <h1 class="auth-page__title">{{ t('auth.register.title') }}</h1>

    <form class="auth-page__form" @submit.prevent="onSubmit">
      <AppInput
        v-model="form.email"
        :label="t('auth.fields.email')"
        :type="APP_INPUT_TYPE.email"
        :autocomplete="AUTH_AUTOCOMPLETE.email"
        :variant="APP_INPUT_VARIANT.underline"
        :icon="APP_INPUT_ICON.email"
        :error="getDirtyFieldError(r$.email)"
      />
      <AppInput
        v-model="form.password"
        :label="t('auth.fields.password')"
        :type="APP_INPUT_TYPE.password"
        :autocomplete="AUTH_AUTOCOMPLETE.newPassword"
        :variant="APP_INPUT_VARIANT.underline"
        :icon="APP_INPUT_ICON.password"
        :error="getDirtyFieldError(r$.password)"
      />
      <AppInput
        v-model="form.confirmPassword"
        :label="t('auth.fields.confirmPassword')"
        :type="APP_INPUT_TYPE.password"
        :autocomplete="AUTH_AUTOCOMPLETE.newPassword"
        :variant="APP_INPUT_VARIANT.underline"
        :icon="APP_INPUT_ICON.password"
        :error="getDirtyFieldError(r$.confirmPassword)"
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
          {{ t('auth.register.submit') }}
        </AppButton>
      </div>
    </form>

    <p class="auth-page__footer">
      <span>{{ t('auth.register.hasAccount') }}</span>
      <button type="button" class="auth-page__link auth-page__link--emphasis" @click="goToLogin">
        {{ t('auth.register.toLogin') }}
      </button>
    </p>
  </AuthPageShell>
</template>

<script setup lang="ts">
import { ref } from 'vue'
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
import '@/styles/views/register.css'

const { t } = useI18n()
const router = useRouter()
const { goToLogin } = useAppNavigation()
const { register } = useAuth()

const form = ref({
  email: '',
  password: '',
  confirmPassword: '',
})
const formError = ref('')
const formSuccess = ref('')
const isSubmitting = ref(false)

const { r$ } = useRegle(form, {
  email: {
    required: withMessage(required, () => t('auth.validation.required')),
    email: withMessage(email, () => t('auth.validation.email')),
  },
  password: {
    required: withMessage(required, () => t('auth.validation.required')),
    minLength: withMessage(minLength(AUTH_PASSWORD_MIN_LENGTH), () =>
      t('auth.validation.minPassword', { min: AUTH_PASSWORD_MIN_LENGTH }),
    ),
  },
  confirmPassword: {
    required: withMessage(required, () => t('auth.validation.required')),
    sameAs: withMessage(sameAs(() => form.value.password), () =>
      t('auth.validation.passwordMismatch'),
    ),
  },
})

async function onSubmit(): Promise<void> {
  formError.value = ''
  formSuccess.value = ''

  const { valid } = await r$.$validate()

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
    const result = await register(form.value.email, form.value.password)

    if (!result.ok) {
      formError.value = t(`auth.errors.${result.code}`)
      return
    }

    if (result.session) {
      formSuccess.value = t('auth.register.success')
      await router.push({ name: ROUTE_NAMES.onboarding })
      return
    }

    formSuccess.value = t('auth.register.checkEmail')
  } finally {
    isSubmitting.value = false
  }
}
</script>
