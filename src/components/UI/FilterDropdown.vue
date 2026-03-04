<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  label: {
    type: String,
    required: true
  },
  options: {
    type: Array,
    required: true
  },
  modelValue: {
    type: [String, Number, null],
    default: null
  },
  placeholder: {
    type: String,
    default: 'Select...'
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  }
})

const emit = defineEmits(['update:modelValue'])

const isOpen = ref(false)
const localValue = ref(props.modelValue)

watch(localValue, (newValue) => {
  emit('update:modelValue', newValue)
  isOpen.value = false
})

watch(() => props.modelValue, (newValue) => {
  localValue.value = newValue
})

const displayValue = computed(() => {
  const option = props.options.find(opt => opt.value === localValue.value)
  return option ? option.label : props.placeholder
})

const sizes = {
  sm: 'min-w-[140px] text-sm',
  md: 'min-w-[180px]',
  lg: 'min-w-[220px] text-base'
}

function selectOption(value) {
  localValue.value = value
  isOpen.value = false
}
</script>

<template>
  <div class="relative" :class="[sizes[size]]">
    <label class="block text-sm font-medium text-secondary mb-1.5">{{ label }}</label>
    <div class="relative">
      <button
        @click="isOpen = !isOpen"
        type="button"
        class="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary bg-white text-left flex items-center justify-between transition-all hover:border-primary/50"
      >
        <span class="truncate">{{ displayValue }}</span>
        <svg
          class="w-5 h-5 text-gray-400 transition-transform"
          :class="{ 'rotate-180': isOpen }"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <Transition
        enter-active-class="transition-all duration-200 ease-out"
        enter-from-class="opacity-0 scale-95 -translate-y-1"
        enter-to-class="opacity-100 scale-100 translate-y-0"
        leave-active-class="transition-all duration-150 ease-in"
        leave-from-class="opacity-100 scale-100 translate-y-0"
        leave-to-class="opacity-0 scale-95 -translate-y-1"
      >
        <div
          v-if="isOpen"
          class="absolute z-20 mt-1 w-full bg-white rounded-lg shadow-lg border border-gray-200 py-1 max-h-60 overflow-auto"
        >
          <button
            v-for="option in options"
            :key="option.value"
            @click="selectOption(option.value)"
            type="button"
            class="w-full px-3 py-2 text-left hover:bg-primary/5 transition-colors"
            :class="[
              localValue === option.value
                ? 'bg-primary/10 text-primary font-medium'
                : 'text-gray-700'
            ]"
          >
            {{ option.label }}
          </button>
        </div>
      </Transition>
    </div>
  </div>
</template>
