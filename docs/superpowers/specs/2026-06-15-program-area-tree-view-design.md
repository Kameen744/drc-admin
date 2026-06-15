# Program Area Tree View Design

## Overview

The `Program_Area` field has changed from a simple array of strings to a deeply nested JSON object with funding information at leaf nodes. This spec covers redesigning the submissions view to accurately display and edit this data.

## Data Structure

```json
{
  "Disease Control and Prevention": {
    "Emergency Response and Preparedness": {
      "Case Management and Reporting": {
        "_funding": {
          "amount": 9500,
          "disbursed": 9500,
          "funder": "European Union",
          "status": "Active funding support available"
        }
      },
      "Disease Surveillance": { ... }
    }
  }
}
```

3 levels deep: Program Area → Sub-Area → Activity → `_funding`

## Scope

Full update: detail modal (view + edit), table column, helper utilities.

## Approach

**Tree View** with collapsible/expandable nodes. Best represents the natural hierarchy, scales to any depth, and shows funding inline at leaf nodes.

## Detailed Design

### 1. New Component: `ProgramAreaTree.vue`

**Props:**
- `modelValue` (Object) — the Program_Area JSON object
- `readonly` (Boolean) — view vs edit mode

**View Mode:**
- Recursive tree rendering using the component itself
- Each non-leaf row is clickable to expand/collapse (`▶` / `▾`)
- Indentation per level (pl-6 per depth)
- Top-level areas get a colored left border accent (cycle through 4-5 colors)
- Leaf nodes (keys that have `_funding` sub-key) show a compact funding card:
  - Progress bar: `(disbursed / amount) * 100` width
  - Amount line: `$X disbursed of $Y`
  - Funder badge (small, gray)
  - Status pill (green for Active, yellow for Pending, red for Inactive)

**Edit Mode:**
- Same tree display, but funding fields become editable inline
- `amount` / `disbursed`: number input with $ prefix
- `funder`: text input
- `status`: dropdown (Active, Inactive, Pending + free text)
- Changes flow back via v-model (emit `update:modelValue`)

**Tree State:**
- Local reactive `expanded` Set to track which paths are open
- No API calls on expand — all data is in the prop

### 2. Detail Modal Updates (`ViewRecordModal.vue`)

**View Mode:**
- Replace the current `formatArray(record.Program_Area)` badge block with `<ProgramAreaTree :model-value="record.Program_Area" readonly />`
- Place in the "Support Details" section where Program Areas currently display

**Edit Mode:**
- Replace the current `Program_Area` text input with `<ProgramAreaTree v-model="editForm.Program_Area" :readonly="false" />`
- `editForm.Program_Area` stores the full JSON object (not a string)
- On save, the JSON is sent directly to PocketBase — no split/join

### 3. Table Column (`SubmissionsTable.vue`)

- Add new column `Program_Area` between `Name_of_Funder` and `stateName`
- Show up to 2 top-level program area names as green badges
- If more than 2, show `+N more` badge with tooltip showing full list
- Top-level names extracted via helper: `extractProgramAreaNames()`

Column definition:
```js
{ key: "Program_Area", label: "Program Areas" }
```

### 4. Helper Utilities (`helpers.js`)

```js
// Get top-level program area names from the nested object
export function extractProgramAreaNames(obj) {
  if (!obj || typeof obj !== 'object') return []
  return Object.keys(obj).filter(k => k !== '_funding')
}

// Format number as currency
export function formatCurrency(amount) {
  if (amount == null || isNaN(amount)) return 'N/A'
  return '$' + Number(amount).toLocaleString()
}
```

### 5. i18n Updates

Add `fields.programAreas` to table header in `en.json` and `fr.json`:
```
"programAreas": "Program Areas"
```

## Files to Change

| File | Changes |
|------|---------|
| `src/components/Submissions/ProgramAreaTree.vue` | **New** — tree component |
| `src/components/Submissions/ViewRecordModal.vue` | Replace Program_Area display + edit fields with ProgramAreaTree |
| `src/components/Submissions/SubmissionsTable.vue` | Add Program_Area column with badge display |
| `src/utils/helpers.js` | Add extractProgramAreaNames and formatCurrency |
| `src/i18n/en.json` | Add programAreas table header |
| `src/i18n/fr.json` | Add programAreas table header |

## Not in Scope

- Table sorting by Program_Area column (complex with JSON data)
- Adding/removing program area branches in edit mode (read-only tree structure)
- Program_Area filtering in the filter dropdown
