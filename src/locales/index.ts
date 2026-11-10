import { createI18n } from 'vue-i18n'
import enAuth from '@/locales/en/auth.json'
import enCommon from '@/locales/en/common.json'
import enDashboard from '@/locales/en/dashboard.json'
import enMeals from '@/locales/en/meals.json'
import ukAuth from '@/locales/uk/auth.json'
import ukCommon from '@/locales/uk/common.json'
import ukDashboard from '@/locales/uk/dashboard.json'
import ukMeals from '@/locales/uk/meals.json'
import { readStoredLocale } from '@/utils/localeStorage'

export const i18n = createI18n({
  legacy: false,
  locale: readStoredLocale(),
  fallbackLocale: 'uk',
  messages: {
    uk: {
      common: ukCommon,
      auth: ukAuth,
      dashboard: ukDashboard,
      meals: ukMeals,
    },
    en: {
      common: enCommon,
      auth: enAuth,
      dashboard: enDashboard,
      meals: enMeals,
    },
  },
})
