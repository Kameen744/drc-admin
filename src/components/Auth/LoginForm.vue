<script setup>
import { ref } from 'vue'
import Input from '@/components/UI/Input.vue'
import Button from '@/components/UI/Button.vue'
import { t } from '@/i18n'

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
    emailError.value = t("auth.emailRequired")
    isValid = false
  } else if (!validateEmail(email.value)) {
    emailError.value = t("auth.validEmail")
    isValid = false
  }

  if (!password.value) {
    passwordError.value = t("auth.passwordRequired")
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
      :label="t('auth.email.label')"
      :placeholder="t('auth.email.placeholder')"
      :error="emailError"
      required
    />
    <Input
      v-model="password"
      type="password"
      :label="t('auth.password.label')"
      :placeholder="t('auth.password.placeholder')"
      :error="passwordError"
      required
    />
    <Button type="submit" variant="primary" class="w-full">
      {{ t("auth.login") }}
    </Button>
  </form>
</template>
