<template>
  <AuthPageShell>
    <h1 class="auth-page__title">{{ t('auth.login.title') }}</h1>

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
        :autocomplete="AUTH_AUTOCOMPLETE.currentPassword"
        :variant="APP_INPUT_VARIANT.underline"
        :icon="APP_INPUT_ICON.password"
        :error="getDirtyFieldError(r$.password)"
      />

      <div class="auth-page__meta">
        <label class="auth-page__remember">
          <input
            v-model="rememberMe"
            class="auth-page__remember-input"
            type="checkbox"
          />
          <span>{{ t('auth.login.rememberMe') }}</span>
        </label>
        <button
          type="button"
          class="auth-page__link"
          @click="goToResetPassword"
        >
          {{ t('auth.login.forgotPassword') }}
        </button>
      </div>

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
          {{ t('auth.login.submit') }}
        </AppButton>
      </div>
    </form>

    <p class="auth-page__footer">
      <span>{{ t('auth.login.noAccount') }}</span>
      <button type="button" class="auth-page__link auth-page__link--emphasis" @click="goToRegister">
        {{ t('auth.login.toRegister') }}
      </button>
    </p>
  </AuthPageShell>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useRegle } from '@regle/core'
import { email, minLength, required, withMessage } from '@regle/rules'
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
import { resolvePostAuthRoute } from '@/utils/postAuthRoute'
import {
  getRememberedEmail,
  setRememberedEmail,
} from '@/utils/rememberEmail'
import '@/styles/views/login.css'

const { t } = useI18n()
const router = useRouter()
const { goToRegister, goToResetPassword } = useAppNavigation()
const { login } = useAuth()

const rememberedEmail = getRememberedEmail()

const form = ref({
  email: rememberedEmail,
  password: '',
})
const rememberMe = ref(Boolean(rememberedEmail))
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
    const result = await login(form.value.email, form.value.password)

    if (!result.ok) {
      formError.value = t(`auth.errors.${result.code}`)
      return
    }

    setRememberedEmail(form.value.email, rememberMe.value)
    formSuccess.value = t('auth.login.success')

    const nextRoute = result.user?.id
      ? await resolvePostAuthRoute(result.user.id)
      : ROUTE_NAMES.dashboard

    await router.push({ name: nextRoute })
  } finally {
    isSubmitting.value = false
  }
}
</script>
