import { createPinia } from 'pinia'
import { VueQueryPlugin, QueryClient } from '@tanstack/vue-query'
import { createApp } from 'vue'
import App from './App.vue'
import { i18n } from './locales'
import { router } from './router'

const app = createApp(App)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

app.use(createPinia())
app.use(VueQueryPlugin, { queryClient })
app.use(router)
app.use(i18n)
app.mount('#app')
