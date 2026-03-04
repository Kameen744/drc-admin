<script setup>
const props = defineProps({
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'bordered', 'elevated', 'flat'].includes(value)
  },
  padding: {
    type: String,
    default: 'md',
    validator: (value) => ['none', 'sm', 'md', 'lg'].includes(value)
  },
  hoverable: {
    type: Boolean,
    default: false
  }
})

const classes = {
  default: 'bg-white rounded-lg shadow-sm',
  bordered: 'bg-white rounded-lg border border-gray-200',
  elevated: 'bg-white rounded-xl shadow-md',
  flat: 'bg-white rounded-none shadow-none'
}

const paddings = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8'
}
</script>

<template>
  <div
    :class="[
      classes[variant],
      paddings[padding],
      hoverable && 'hover:shadow-md transition-shadow duration-200'
    ]"
  >
    <slot />
  </div>
</template>
