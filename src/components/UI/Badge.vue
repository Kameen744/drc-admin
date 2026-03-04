<script setup>
const props = defineProps({
  variant: {
    type: String,
    default: 'default',
    validator: (value) => [
      'default', 'success', 'warning', 'danger', 'info', 'primary', 'secondary'
    ].includes(value)
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  },
  dot: {
    type: Boolean,
    default: false
  }
})

const classes = {
  default: 'bg-gray-100 text-gray-800',
  success: 'bg-green-100 text-green-800',
  warning: 'bg-yellow-100 text-yellow-800',
  danger: 'bg-red-100 text-red-800',
  info: 'bg-blue-100 text-blue-800',
  primary: 'bg-teal-50 text-primary border border-primary/20',
  secondary: 'bg-blue-50 text-secondary border border-secondary/20'
}

const sizes = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-base'
}
</script>

<template>
  <span
    :class="[
      'inline-flex items-center gap-1.5 rounded-full font-medium',
      classes[variant],
      sizes[size]
    ]"
  >
    <span v-if="dot" class="w-1.5 h-1.5 rounded-full bg-current"></span>
    <slot />
  </span>
</template>
