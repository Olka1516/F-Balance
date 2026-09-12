/**
 * Maps a profile service error code to an i18n message key path.
 */
export function resolveProfileErrorI18nKey(code: string): string {
  if (code === 'tableMissing' || code === 'permissionDenied') {
    return `common.profile.errors.${code}`
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

  return 'common.profile.errors.unknown'
}
