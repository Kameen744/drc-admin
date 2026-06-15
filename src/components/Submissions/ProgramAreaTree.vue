<script setup>
import { ref, computed } from 'vue'
import { formatCurrency, calculateFundingProgress } from '@/utils/helpers'

defineOptions({ name: 'ProgramAreaTree' })

const props = defineProps({
  modelValue: {
    type: [Object, Array, String],
    default: null,
  },
  readonly: {
    type: Boolean,
    default: true,
  },
  depth: {
    type: Number,
    default: 0,
  },
})

const emit = defineEmits(['update:modelValue'])

const expanded = ref(new Set())

const entries = computed(() => {
  if (!props.modelValue || typeof props.modelValue !== 'object' || Array.isArray(props.modelValue)) return []
  return Object.entries(props.modelValue).filter(([key]) => key !== '_funding')
})

const fundingInfo = computed(() => {
  if (!props.modelValue || typeof props.modelValue !== 'object') return null
  return props.modelValue._funding || null
})

const hasChildren = computed(() => entries.value.length > 0)

const isLeaf = computed(() => fundingInfo.value && !hasChildren.value)

function toggle(key) {
  const set = new Set(expanded.value)
  if (set.has(key)) set.delete(key)
  else set.add(key)
  expanded.value = set
}

function isOpen(key) {
  return expanded.value.has(key)
}

const accentColors = [
  'border-l-[#09cbc0]',
  'border-l-blue-500',
  'border-l-purple-500',
  'border-l-orange-500',
  'border-l-pink-500',
]

function getAccent(index) {
  return accentColors[index % accentColors.length]
}

const statusStyles = {
  'Active funding support available': 'bg-green-100 text-green-700 border-green-200',
  'Active': 'bg-green-100 text-green-700 border-green-200',
  'Inactive': 'bg-red-100 text-red-700 border-red-200',
  'Pending': 'bg-yellow-100 text-yellow-700 border-yellow-200',
}

function getStatusStyle(status) {
  return statusStyles[status] || 'bg-gray-100 text-gray-700 border-gray-200'
}

function updateFundingField(field, value) {
  if (!props.modelValue || typeof props.modelValue !== 'object') return
  const currentFunding = props.modelValue._funding || {}
  const updated = {
    ...props.modelValue,
    _funding: {
      ...currentFunding,
      [field]: field === 'amount' || field === 'disbursed' ? Number(value) : value,
    },
  }
  emit('update:modelValue', updated)
}

const depthPadding = computed(() => {
  return props.depth > 0 ? { marginLeft: `${Math.min(props.depth * 16, 32)}px` } : {}
})

const fundingItems = computed(() => {
  const items = []
  function walk(obj, path) {
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return
    for (const [key, value] of Object.entries(obj)) {
      if (key === '_funding') continue
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        if (value._funding && typeof value._funding === 'object') {
          items.push({
            path: [...path, key],
            name: key,
            funding: value._funding,
          })
        }
        walk(value, [...path, key])
      }
    }
  }
  walk(props.modelValue, [])
  return items
})
</script>

<template>
  <div>
    <!-- View mode: flat funding cards -->
    <div v-if="readonly" class="space-y-2">
      <div v-if="fundingItems.length > 0">
        <div
          v-for="(item, index) in fundingItems"
          :key="index"
          class="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm"
        >
          <div class="px-3 pt-2.5 pb-0">
            <div class="flex flex-wrap items-center gap-1 text-xs text-gray-400 mb-0.5">
              <template v-for="(segment, sIndex) in item.path.slice(0, -1)" :key="sIndex">
                <span class="truncate max-w-[140px]" :title="segment">{{ segment }}</span>
                <span v-if="sIndex < item.path.length - 2" class="text-gray-300 shrink-0">›</span>
              </template>
            </div>
            <div class="font-semibold text-gray-900">{{ item.name }}</div>
          </div>
          <div class="px-3 pb-3 pt-2">
            <div class="bg-[#f8f9fc] rounded-lg border border-gray-100 p-3">
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs font-medium text-gray-500 uppercase tracking-wide">Funding</span>
                <span
                  class="text-xs px-2 py-0.5 rounded-full border font-medium"
                  :class="getStatusStyle(item.funding.status)"
                >
                  {{ item.funding.status || 'N/A' }}
                </span>
              </div>
              <div class="space-y-1.5">
                <div class="flex justify-between text-sm">
                  <span class="text-gray-500">Disbursed</span>
                  <span class="font-semibold text-gray-900">{{ formatCurrency(item.funding.disbursed) }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-gray-500">Total Amount</span>
                  <span class="font-semibold text-gray-900">{{ formatCurrency(item.funding.amount) }}</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                  <div
                    class="bg-[#09cbc0] h-1.5 rounded-full transition-all duration-300"
                    :style="{ width: calculateFundingProgress(item.funding) + '%' }"
                  ></div>
                </div>
              </div>
              <div v-if="item.funding.funder" class="mt-2 pt-2 border-t border-gray-200 text-xs text-gray-500">
                Funder: <span class="font-medium text-gray-700">{{ item.funding.funder }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="text-sm text-gray-400 italic px-3 py-1">
        No program areas
      </div>
    </div>

    <!-- Edit mode: collapsible tree with editable funding -->
    <div v-else class="space-y-0.5">
      <div v-if="isLeaf" :style="depthPadding">
        <div class="bg-gray-50 rounded-lg border border-gray-200 p-3 space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-sm font-medium text-gray-700">💰 Funding</span>
            <span
              v-if="fundingInfo.status"
              class="text-xs px-2 py-0.5 rounded-full border font-medium"
              :class="getStatusStyle(fundingInfo.status)"
            >
              {{ fundingInfo.status }}
            </span>
          </div>
          <div class="space-y-1">
            <div class="flex justify-between text-sm">
              <span class="text-gray-500">Disbursed</span>
              <input
                :value="fundingInfo.disbursed"
                @input="updateFundingField('disbursed', $event.target.value)"
                type="number"
                class="w-28 px-2 py-0.5 text-sm text-right border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#09cbc0] focus:border-[#09cbc0]"
              />
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-500">Total Amount</span>
              <input
                :value="fundingInfo.amount"
                @input="updateFundingField('amount', $event.target.value)"
                type="number"
                class="w-28 px-2 py-0.5 text-sm text-right border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#09cbc0] focus:border-[#09cbc0]"
              />
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div
                class="bg-[#09cbc0] h-2 rounded-full transition-all duration-300"
                :style="{ width: calculateFundingProgress(fundingInfo) + '%' }"
              ></div>
            </div>
          </div>
          <div class="border-t border-gray-200 pt-2 mt-1 space-y-2">
            <div>
              <label class="text-xs text-gray-500">Funder</label>
              <input
                :value="fundingInfo.funder || ''"
                @input="updateFundingField('funder', $event.target.value)"
                type="text"
                class="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#09cbc0] focus:border-[#09cbc0]"
              />
            </div>
            <div>
              <label class="text-xs text-gray-500">Status</label>
              <select
                :value="fundingInfo.status || ''"
                @change="updateFundingField('status', $event.target.value)"
                class="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#09cbc0] focus:border-[#09cbc0]"
              >
                <option value="">Select...</option>
                <option value="Active funding support available">Active funding support available</option>
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <template v-for="([key, value], index) in entries" :key="key">
        <div>
          <div
            class="flex items-center gap-2 px-3 py-1.5 rounded-md cursor-pointer hover:bg-gray-50 transition-colors border-l-4"
            :class="depth === 0 ? getAccent(index) : 'border-l-transparent'"
            :style="depth > 0 ? depthPadding : {}"
            @click="toggle(key)"
          >
            <span class="text-xs text-gray-400 w-4 text-center select-none">
              {{ isOpen(key) ? '▾' : '▸' }}
            </span>
            <span
              class="text-sm font-medium"
              :class="depth === 0 ? 'text-[#20355a]' : 'text-gray-700'"
            >
              {{ key }}
            </span>
          </div>
          <div v-if="isOpen(key)" class="border-l border-gray-100 ml-4 pl-2">
            <ProgramAreaTree
              :modelValue="value"
              :readonly="readonly"
              :depth="depth + 1"
              @update:modelValue="(val) => {
                emit('update:modelValue', { ...props.modelValue, [key]: val })
              }"
            />
          </div>
        </div>
      </template>

      <div v-if="!entries.length && !fundingInfo" class="text-sm text-gray-400 italic px-3 py-1">
        No program areas
      </div>
    </div>
  </div>
</template>
