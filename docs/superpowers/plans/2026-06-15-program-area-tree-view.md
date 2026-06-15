# Program Area Tree View Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the flat Program_Area badge display with a hierarchical tree view that shows the nested object structure and funding information, plus add a Program_Area column to the submissions table.

**Architecture:** A new `ProgramAreaTree.vue` recursive component handles both view and edit modes via a `readonly` prop. View mode renders a collapsible tree with funding cards at leaf nodes; edit mode makes funding fields inline-editable. The detail modal and table are updated to use it.

**Tech Stack:** Vue 3 (Composition API, `<script setup>`), Tailwind CSS, date-fns

---

### Task 1: Add helper utilities

**Files:**
- Modify: `src/utils/helpers.js`

- [ ] **Step 1: Add `extractProgramAreaNames` and `formatCurrency` to helpers.js**

Add these functions after `getStatusText`:

```js
export function extractProgramAreaNames(obj) {
  if (!obj || typeof obj !== 'object') return []
  return Object.keys(obj).filter(k => k !== '_funding')
}

export function formatCurrency(amount) {
  if (amount == null || isNaN(Number(amount))) return 'N/A'
  return '$' + Number(amount).toLocaleString()
}

export function calculateFundingProgress(funding) {
  if (!funding || !funding.amount || !funding.disbursed) return 0
  return Math.min(100, Math.round((funding.disbursed / funding.amount) * 100))
}
```

Pick any unused line number (after line 43) to append these. Verify the file ends properly.

- [ ] **Step 2: Verify helper functions work**

Run: `bun -e "const { extractProgramAreaNames, formatCurrency, calculateFundingProgress } = require('./src/utils/helpers.js'); console.log('helpers loaded')"` to confirm syntax is valid.

- [ ] **Step 3: Commit**

```bash
git add src/utils/helpers.js
git commit -m "feat: add Program_Area helper utilities"
```

---

### Task 2: Create ProgramAreaTree component (view + edit mode)

**Files:**
- Create: `src/components/Submissions/ProgramAreaTree.vue`

- [ ] **Step 1: Create the ProgramAreaTree component**

Write the file at `src/components/Submissions/ProgramAreaTree.vue`:

```vue
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
</script>

<template>
  <div class="space-y-0.5">
    <!-- Leaf node with funding -->
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
            <span v-if="readonly" class="font-medium text-gray-900">{{ formatCurrency(fundingInfo.disbursed) }}</span>
            <input
              v-else
              :value="fundingInfo.disbursed"
              @input="updateFundingField('disbursed', $event.target.value)"
              type="number"
              class="w-28 px-2 py-0.5 text-sm text-right border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#09cbc0] focus:border-[#09cbc0]"
            />
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-gray-500">Total Amount</span>
            <span v-if="readonly" class="font-medium text-gray-900">{{ formatCurrency(fundingInfo.amount) }}</span>
            <input
              v-else
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
        <div v-if="readonly && fundingInfo.funder" class="text-xs text-gray-500">
          Funder: <span class="font-medium text-gray-700">{{ fundingInfo.funder }}</span>
        </div>
        <div v-if="!readonly" class="border-t border-gray-200 pt-2 mt-1 space-y-2">
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

    <!-- Branch nodes -->
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

    <!-- Empty state -->
    <div v-if="!entries.length && !fundingInfo" class="text-sm text-gray-400 italic px-3 py-1">
      No program areas
    </div>
  </div>
</template>
```

**Note:** `defineOptions` requires Vue 3.3+. Check the Vue version in `package.json` — this project uses Vite 7 + Vue 3 so it should be fine.

- [ ] **Step 2: Commit**

```bash
git add src/components/Submissions/ProgramAreaTree.vue
git commit -m "feat: create ProgramAreaTree component with view/edit modes"
```

---

### Task 3: Update ViewRecordModal to use ProgramAreaTree

**Files:**
- Modify: `src/components/Submissions/ViewRecordModal.vue`

- [ ] **Step 1: Import ProgramAreaTree and update helpers import**

Add the import after line 5:

```js
import ProgramAreaTree from "@/components/Submissions/ProgramAreaTree.vue";
```

Update the helpers import on line 5 to also include `extractProgramAreaNames`:

```js
import { formatDate, formatArray, extractFromArray, extractProgramAreaNames } from "@/utils/helpers";
```

- [ ] **Step 2: Replace Program_Area display in view mode (lines 386-401)**

Replace the entire "Program Areas" field block (lines 386-401):

Old:
```html
<div class="space-y-1">
    <label class="text-xs font-medium text-gray-500 uppercase tracking-wide">{{ t("fields.programAreas") }}</label>
    <div class="flex flex-wrap gap-1.5 mt-1">
        <span
            v-for="(area, index) in formatArray(record.Program_Area)"
            :key="index"
            class="px-2.5 py-1 bg-green-50 text-green-700 rounded-md text-sm font-medium border border-green-100"
        >
            {{ area }}
        </span>
        <span
            v-if="!record.Program_Area || record.Program_Area.length === 0"
            class="text-gray-400"
        >{{ t("app.na") }}</span>
    </div>
</div>
```

New:
```html
<div class="md:col-span-2 space-y-1">
    <label class="text-xs font-medium text-gray-500 uppercase tracking-wide">{{ t("fields.programAreas") }}</label>
    <div class="mt-1">
        <ProgramAreaTree
            v-if="record.Program_Area && typeof record.Program_Area === 'object' && !Array.isArray(record.Program_Area)"
            :modelValue="record.Program_Area"
            readonly
        />
        <span v-else class="text-gray-400">{{ t("app.na") }}</span>
    </div>
</div>
```

- [ ] **Step 3: Replace Program_Area edit field (lines 229-233)**

Old:
```html
<div class="space-y-1">
    <label class="text-xs font-medium text-gray-500 uppercase tracking-wide">{{ t("fields.programAreasHint") }}</label>
    <input v-model="editForm.Program_Area" type="text"
        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-sm" />
</div>
```

New:
```html
<div class="md:col-span-2 space-y-1">
    <label class="text-xs font-medium text-gray-500 uppercase tracking-wide">{{ t("fields.programAreas") }}</label>
    <ProgramAreaTree
        v-if="editForm.Program_Area && typeof editForm.Program_Area === 'object' && !Array.isArray(editForm.Program_Area)"
        v-model="editForm.Program_Area"
        :readonly="false"
    />
    <span v-else class="text-sm text-gray-400 italic">No program area data</span>
</div>
```

- [ ] **Step 4: Remove old Program_Area serialize/deserialize in edit mode**

In `startEditing()` function (lines 57-81), replace the Program_Area assignment (lines 64-66):

Old:
```js
editForm.Program_Area = Array.isArray(record.value.Program_Area)
    ? record.value.Program_Area.join(", ")
    : record.value.Program_Area || "";
```

New:
```js
editForm.Program_Area = (record.value.Program_Area && typeof record.value.Program_Area === 'object')
    ? JSON.parse(JSON.stringify(record.value.Program_Area))
    : record.value.Program_Area || {};
```

In `saveChanges()` function (lines 87-119), remove the Program_Area split/join logic (lines 96-99):

Old:
```js
Program_Area: editForm.Program_Area
    .split(",")
    .map(s => s.trim())
    .filter(Boolean),
```

New:
```js
Program_Area: editForm.Program_Area,
```

- [ ] **Step 5: Commit**

```bash
git add src/components/Submissions/ViewRecordModal.vue
git commit -m "feat: integrate ProgramAreaTree into detail modal"
```

---

### Task 4: Add Program_Area column to SubmissionsTable

**Files:**
- Modify: `src/components/Submissions/SubmissionsTable.vue`
- Modify: `src/i18n/en.json`
- Modify: `src/i18n/fr.json`

- [ ] **Step 1: Add Program_Area column definition (line 93-102)**

Insert after the `Name_of_Funder` column (after line 95):

```js
{ key: "Program_Area", label: t("table.programAreas") },
```

- [ ] **Step 2: Add the Program_Area template slot**

Insert after the `#Name_of_Funder` template (after line 222) — before the `#stateName` template:

```html
<template #Program_Area="{ row }">
    <div v-if="row.Program_Area && typeof row.Program_Area === 'object' && !Array.isArray(row.Program_Area)" class="flex flex-wrap gap-1 items-center">
        <span
            v-for="(area, index) in extractProgramAreaNames(row.Program_Area).slice(0, 2)"
            :key="index"
            class="inline-flex items-center gap-1 text-xs bg-green-50 text-green-700 rounded px-1.5 py-0.5"
        >
            {{ area }}
        </span>
        <span
            v-if="extractProgramAreaNames(row.Program_Area).length > 2"
            class="text-xs text-gray-500 bg-gray-100 rounded px-1.5 py-0.5 cursor-help"
            :title="extractProgramAreaNames(row.Program_Area).join(', ')"
        >
            +{{ extractProgramAreaNames(row.Program_Area).length - 2 }} {{ t("app.more") }}
        </span>
    </div>
    <span v-else class="text-gray-400">{{ t("app.na") }}</span>
</template>
```

- [ ] **Step 3: Update import in SubmissionsTable.vue**

Change line 7 from:
```js
import { formatDate, getBadgeClass, extractFromArray } from "@/utils/helpers";
```
to:
```js
import { formatDate, getBadgeClass, extractFromArray, extractProgramAreaNames } from "@/utils/helpers";
```

- [ ] **Step 4: Add i18n entries for programAreas table header**

In `src/i18n/en.json`, after `"funder": "Funder",` (line 54):

```json
"programAreas": "Program Areas",
```

In `src/i18n/fr.json` — first read it:

```bash
cat src/i18n/fr.json | head -60
```

Then find the `"funder"` line and add:

```json
"programAreas": "Domaines de Programme",
```

- [ ] **Step 5: Commit**

```bash
git add src/components/Submissions/SubmissionsTable.vue src/i18n/en.json src/i18n/fr.json
git commit -m "feat: add Program_Area column to submissions table"
```

---

### Task 5: Verify everything works

- [ ] **Step 1: Build the project**

Run: `bun run build`

Expected: Build succeeds with no errors.

- [ ] **Step 2: Run dev server (optional)**

Run: `bun run dev`

Navigate to `/submissions`, open a record with Program_Area data, verify:
- Tree view shows the nested hierarchy with expand/collapse
- Funding cards display correctly with progress bars
- Edit mode shows editable funding fields
- Table column shows top-level program area badges

- [ ] **Step 3: Final verification**

```bash
git status
```
Expected: clean working directory, all changes committed.
