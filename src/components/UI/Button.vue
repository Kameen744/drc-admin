<script setup>
import { computed } from 'vue'

const props = defineProps({
  type: {
    type: String,
    default: 'button'
  },
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'danger', 'outline-primary', 'outline-secondary', 'ghost'].includes(value)
  },
  disabled: {
    type: Boolean,
    default: false
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg', 'icon'].includes(value)
  },
  loading: {
    type: Boolean,
    default: false
  },
  icon: {
    type: String,
    default: ''
  }
})

const classes = computed(() => {
  const base = 'rounded-lg font-medium transition-all duration-200 inline-flex items-center justify-center gap-2'

  const variants = {
    primary: 'bg-primary hover:bg-primary/90 text-white shadow-sm hover:shadow',
    secondary: 'bg-secondary hover:bg-secondary/90 text-white shadow-sm hover:shadow',
    danger: 'bg-red-500 hover:bg-red-600 text-white shadow-sm hover:shadow',
    'outline-primary': 'bg-transparent border-2 border-primary text-primary hover:bg-primary hover:text-white',
    'outline-secondary': 'bg-transparent border-2 border-secondary text-secondary hover:bg-secondary hover:text-white',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100'
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
    icon: 'p-2'
  }

  return [
    base,
    variants[props.variant],
    sizes[props.size],
    props.disabled && 'opacity-50 cursor-not-allowed',
    props.loading && 'cursor-wait'
  ].filter(Boolean).join(' ')
})
</script>

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="classes"
  >
    <svg v-if="loading" class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    <span v-if="icon && !loading" class="text-lg">{{ icon }}</span>
    <slot />
  </button>
</template>
