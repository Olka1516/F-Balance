/**
 * Registers the installable PWA service worker when the browser supports it.
 */
export function registerServiceWorker(): void {
  if (!('serviceWorker' in navigator)) {
    return
  }

  window.addEventListener('load', () => {
    void navigator.serviceWorker.register('/sw.js').catch(() => undefined)
  })
}
