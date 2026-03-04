import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import pb from '@/lib/pocketbase'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(null)

  const isAuthenticated = computed(() => !!token.value)

  function setAuth(userData) {
    user.value = userData.record
    token.value = userData.token
    localStorage.setItem('pb_auth', JSON.stringify({
      token: userData.token,
      user: userData.record
    }))
  }

  function clearAuth() {
    user.value = null
    token.value = null
    localStorage.removeItem('pb_auth')
    pb.authStore.clear()
  }

  function loadFromStorage() {
    const stored = localStorage.getItem('pb_auth')
    if (stored) {
      const authData = JSON.parse(stored)
      token.value = authData.token
      user.value = authData.user
      pb.authStore.save(authData.token, authData.user)
    }
  }

  async function login(email, password) {
    try {
      const authData = await pb.collection('users').authWithPassword(email, password)
      setAuth(authData)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  async function logout() {
    clearAuth()
    return { success: true }
  }

  return {
    user,
    token,
    isAuthenticated,
    setAuth,
    clearAuth,
    loadFromStorage,
    login,
    logout
  }
})
