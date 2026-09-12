/**
 * Returns the first dirty-field validation error, if any.
 */
export function getDirtyFieldError(field: {
  $errors: string[]
  $dirty: boolean
}): string | undefined {
  if (!field.$dirty || field.$errors.length === 0) {
    return undefined
  }

  return field.$errors[0]
}
