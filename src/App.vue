<script setup>
import { useAuthStore } from '@/stores/auth'
import { onMounted } from 'vue'

const authStore = useAuthStore()

onMounted(() => {
  authStore.loadFromStorage()
})
</script>

<template>
  <router-view />
</template>
