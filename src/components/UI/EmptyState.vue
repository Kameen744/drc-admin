<script setup>
import { computed } from 'vue'
import { t } from '@/i18n'

const props = defineProps({
  icon: {
    type: String,
    default: '📭'
  },
  title: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  actionLabel: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['action'])

const resolvedTitle = computed(() => props.title || t('empty.defaultTitle'))
const resolvedDescription = computed(() => props.description || t('empty.defaultDescription'))
</script>

<template>
  <div class="text-center py-12 px-4">
    <div class="text-6xl mb-4">{{ icon }}</div>
    <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ resolvedTitle }}</h3>
    <p class="text-gray-500 mb-6 max-w-sm mx-auto">{{ resolvedDescription }}</p>
    <Button
      v-if="actionLabel"
      @click="$emit('action')"
      variant="primary"
    >
      {{ actionLabel }}
    </Button>
  </div>
</template>
