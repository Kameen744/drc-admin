<script setup>
const props = defineProps({
  type: {
    type: String,
    default: 'text',
    validator: (value) => ['text', 'circle', 'rect', 'custom'].includes(value)
  },
  width: {
    type: String,
    default: '100%'
  },
  height: {
    type: String,
    default: '1rem'
  },
  lines: {
    type: Number,
    default: 3
  },
  count: {
    type: Number,
    default: 1
  }
})
</script>

<template>
  <div class="space-y-2">
    <template v-for="i in count" :key="i">
      <!-- Text skeleton -->
      <div v-if="type === 'text'" class="space-y-2">
        <div
          v-for="j in lines"
          :key="j"
          class="animate-pulse bg-gray-200 rounded"
          :style="{ width: j === lines ? '70%' : width, height }"
        ></div>
      </div>

      <!-- Circle skeleton -->
      <div
        v-else-if="type === 'circle'"
        class="animate-pulse bg-gray-200 rounded-full"
        :style="{ width, height: width }"
      ></div>

      <!-- Rect skeleton -->
      <div
        v-else-if="type === 'rect'"
        class="animate-pulse bg-gray-200 rounded"
        :style="{ width, height }"
      ></div>

      <!-- Custom slot -->
      <slot v-else-if="type === 'custom'"></slot>
    </template>
  </div>
</template>
