/**
 * Visual style variants for AppButton.
 */
export const APP_BUTTON_VARIANTS = ['primary', 'secondary'] as const

/**
 * AppButton visual style variant.
 */
export type AppButtonVariant = (typeof APP_BUTTON_VARIANTS)[number]

/**
 * Native HTML button type values used by AppButton.
 */
export const APP_BUTTON_TYPES = ['button', 'submit', 'reset'] as const

/**
 * AppButton native HTML type attribute.
 */
export type AppButtonType = (typeof APP_BUTTON_TYPES)[number]

/**
 * Named AppButton visual variant shortcuts.
 */
export const APP_BUTTON_VARIANT = {
  primary: 'primary',
  secondary: 'secondary',
} as const satisfies Record<string, AppButtonVariant>

/**
 * Default AppButton visual variant.
 */
export const APP_BUTTON_DEFAULT_VARIANT: AppButtonVariant =
  APP_BUTTON_VARIANT.primary

/**
 * Default AppButton HTML type.
 */
export const APP_BUTTON_DEFAULT_TYPE: AppButtonType = 'button'

/**
 * Native HTML input type values used by AppInput.
 */
export const APP_INPUT_TYPES = ['text', 'email', 'password', 'number'] as const

/**
 * AppInput native HTML type attribute.
 */
export type AppInputType = (typeof APP_INPUT_TYPES)[number]

/**
 * Named AppInput type shortcuts for forms.
 */
export const APP_INPUT_TYPE = {
  text: 'text',
  email: 'email',
  password: 'password',
  number: 'number',
} as const satisfies Record<string, AppInputType>

/**
 * Default AppInput HTML type.
 */
export const APP_INPUT_DEFAULT_TYPE: AppInputType = APP_INPUT_TYPE.text

/**
 * Visual style variants for AppInput.
 */
export const APP_INPUT_VARIANTS = ['default', 'underline'] as const

/**
 * AppInput visual style variant.
 */
export type AppInputVariant = (typeof APP_INPUT_VARIANTS)[number]

/**
 * Named AppInput visual variant shortcuts for forms.
 */
export const APP_INPUT_VARIANT = {
  default: 'default',
  underline: 'underline',
} as const satisfies Record<string, AppInputVariant>

/**
 * Default AppInput visual variant.
 */
export const APP_INPUT_DEFAULT_VARIANT: AppInputVariant =
  APP_INPUT_VARIANT.default

/**
 * Optional trailing icons for AppInput.
 */
export const APP_INPUT_ICONS = ['none', 'email', 'password'] as const

/**
 * AppInput trailing icon identifier.
 */
export type AppInputIcon = (typeof APP_INPUT_ICONS)[number]

/**
 * Named AppInput icon shortcuts for forms.
 */
export const APP_INPUT_ICON = {
  none: 'none',
  email: 'email',
  password: 'password',
} as const satisfies Record<string, AppInputIcon>

/**
 * Default AppInput icon.
 */
export const APP_INPUT_DEFAULT_ICON: AppInputIcon = APP_INPUT_ICON.none

/**
 * Visual variants for AppLoader.
 */
export const APP_LOADER_VARIANTS = ['spinner', 'skeleton'] as const

/**
 * AppLoader visual variant.
 */
export type AppLoaderVariant = (typeof APP_LOADER_VARIANTS)[number]

/**
 * Spinner variant for AppLoader.
 */
export const APP_LOADER_VARIANT_SPINNER: AppLoaderVariant = 'spinner'

/**
 * Default AppLoader visual variant.
 */
export const APP_LOADER_DEFAULT_VARIANT: AppLoaderVariant = APP_LOADER_VARIANT_SPINNER
