<script setup>
import { computed } from 'vue'

const props = defineProps({
  columns: {
    type: Array,
    required: true
  },
  data: {
    type: Array,
    required: true
  },
  sortColumn: {
    type: String,
    default: ''
  },
  sortDirection: {
    type: String,
    default: 'asc'
  },
  loading: {
    type: Boolean,
    default: false
  },
  striped: {
    type: Boolean,
    default: true
  },
  bordered: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['sort'])

const sortedData = computed(() => {
  if (!props.sortColumn) return props.data

  return [...props.data].sort((a, b) => {
    let aValue = a[props.sortColumn]
    let bValue = b[props.sortColumn]

    if (props.sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })
})

function handleSort(column) {
  if (column.sortable) {
    if (props.sortColumn === column.key) {
      emit('sort', { column: column.key, direction: props.sortDirection === 'asc' ? 'desc' : 'asc' })
    } else {
      emit('sort', { column: column.key, direction: 'asc' })
    }
  }
}

function getSortIcon(column) {
  if (props.sortColumn !== column.key || !column.sortable) return ''
  return props.sortDirection === 'asc' ? '↑' : '↓'
}
</script>

<template>
  <div class="overflow-hidden rounded-lg border border-gray-200">
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50 sticky top-0 z-10">
          <tr>
            <th
              v-for="column in columns"
              :key="column.key"
              @click="handleSort(column)"
              :class="[
                column.sortable ? 'cursor-pointer hover:bg-gray-100 select-none' : '',
                'px-6 py-3.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider transition-colors'
              ]"
            >
              <div class="flex items-center gap-2">
                {{ column.label }}
                <span v-if="column.sortable" class="text-primary">{{ getSortIcon(column) }}</span>
              </div>
            </th>
          </tr>
        </thead>
        <tbody
          class="bg-white divide-y divide-gray-200"
          :class="striped && 'divide-y divide-gray-100'"
        >
          <tr
            v-for="(row, index) in sortedData"
            :key="index"
            class="transition-all duration-150"
            :class="[
              'hover:bg-primary/5 hover:shadow-sm',
              striped && index % 2 === 0 ? 'bg-gray-50/50' : 'bg-white',
              bordered && 'border-b'
            ]"
          >
            <td
              v-for="column in columns"
              :key="column.key"
              class="px-4 py-3 text-sm text-gray-900 max-w-[200px]"
              :class="column.class"
            >
              <slot :name="column.key" :row="row">
                {{ row[column.key] }}
              </slot>
            </td>
          </tr>

          <!-- Loading skeleton rows -->
          <tr v-if="loading" v-for="i in 5" :key="`skeleton-${i}`">
            <td v-for="column in columns" :key="column.key" class="px-6 py-4">
              <div class="animate-pulse bg-gray-200 rounded h-4" style="width: 80%"></div>
            </td>
          </tr>

          <!-- Empty state -->
          <tr v-if="!loading && sortedData.length === 0">
            <td :colspan="columns.length" class="px-6 py-12">
              <div class="text-center">
                <div class="text-5xl mb-3">📭</div>
                <p class="text-gray-500 font-medium">No records found</p>
                <p class="text-gray-400 text-sm mt-1">Try adjusting your filters or search query</p>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
