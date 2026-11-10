import { onMounted, reactive } from 'vue'

/**
 * Reads theme CSS custom properties (e.g. `--color-primary`) once mounted,
 * so canvas charts use the active seasonal palette without hardcoded colors.
 */
export function useThemeColors<const K extends string>(variables: Record<K, string>) {
  const colors = reactive(
    Object.fromEntries(Object.keys(variables).map((key) => [key, ''])),
  ) as Record<K, string>

  onMounted(() => {
    const styles = getComputedStyle(document.documentElement)

    for (const key of Object.keys(variables) as K[]) {
      colors[key] = styles.getPropertyValue(variables[key]).trim()
    }
  })

  return colors
}
