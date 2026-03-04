import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import Toast from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'
import pb, { initPocketBase } from './lib/pocketbase'
import { useAuthStore } from './stores/auth'

import './index.css'

initPocketBase()

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(Toast, {
  autoClose: 3000,
  position: 'top-right',
  theme: 'light',
})

const authStore = useAuthStore()
authStore.loadFromStorage()

app.mount('#app')
