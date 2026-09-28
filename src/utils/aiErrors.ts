/**
 * Maps an AI service error code to an i18n key path.
 */
export function resolveAiErrorI18nKey(code: string): string {
  if (
    code === 'unauthorized' ||
    code === 'cooldown' ||
    code === 'rateLimited' ||
    code === 'dailyLimit' ||
    code === 'invalidDescription' ||
    code === 'invalidImage' ||
    code === 'imageTooLarge' ||
    code === 'unavailable' ||
    code === 'misconfigured' ||
    code === 'modelUnavailable'
  ) {
    return `meals.ai.errors.${code}`
  }

  return 'meals.ai.errors.unknown'
}
