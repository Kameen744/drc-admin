<script setup>
import { ref } from 'vue'
import Input from '@/components/UI/Input.vue'
import Button from '@/components/UI/Button.vue'

const emit = defineEmits(['submit'])

const email = ref('')
const password = ref('')
const emailError = ref('')
const passwordError = ref('')

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

function validate() {
  emailError.value = ''
  passwordError.value = ''

  let isValid = true

  if (!email.value) {
    emailError.value = 'Email is required'
    isValid = false
  } else if (!validateEmail(email.value)) {
    emailError.value = 'Please enter a valid email'
    isValid = false
  }

  if (!password.value) {
    passwordError.value = 'Password is required'
    isValid = false
  }

  return isValid
}

function handleSubmit() {
  if (validate()) {
    emit('submit', { email: email.value, password: password.value })
  }
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="space-y-4">
    <Input
      v-model="email"
      type="email"
      label="Email"
      placeholder="Enter your email"
      :error="emailError"
      required
    />
    <Input
      v-model="password"
      type="password"
      label="Password"
      placeholder="Enter your password"
      :error="passwordError"
      required
    />
    <Button type="submit" variant="primary" class="w-full">
      Login
    </Button>
  </form>
</template>
