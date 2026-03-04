<script setup>
const props = defineProps({
  icon: {
    type: String,
    default: '📭'
  },
  title: {
    type: String,
    default: 'No data found'
  },
  description: {
    type: String,
    default: 'There are no items to display at the moment.'
  },
  actionLabel: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['action'])
</script>

<template>
  <div class="text-center py-12 px-4">
    <div class="text-6xl mb-4">{{ icon }}</div>
    <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ title }}</h3>
    <p class="text-gray-500 mb-6 max-w-sm mx-auto">{{ description }}</p>
    <Button
      v-if="actionLabel"
      @click="$emit('action')"
      variant="primary"
    >
      {{ actionLabel }}
    </Button>
  </div>
</template>
