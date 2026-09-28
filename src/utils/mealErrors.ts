/**
 * Maps a meal service error code to an i18n message key path.
 */
export function resolveMealErrorI18nKey(code: string): string {
  if (
    code === 'tableMissing' ||
    code === 'permissionDenied' ||
    code === 'notFound'
  ) {
    return `meals.errors.${code}`
  }

  if (
    code === 'configMissing' ||
    code === 'connectionFailed' ||
    code === 'unavailable' ||
    code === 'disconnected' ||
    code === 'timeout'
  ) {
    return `auth.errors.${code}`
  }

  return 'meals.errors.unknown'
}
