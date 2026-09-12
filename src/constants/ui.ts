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
 * Default AppButton visual variant.
 */
export const APP_BUTTON_DEFAULT_VARIANT: AppButtonVariant = 'primary'

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
 * Default AppInput HTML type.
 */
export const APP_INPUT_DEFAULT_TYPE: AppInputType = 'text'

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
