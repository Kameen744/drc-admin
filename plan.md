# Admin Dashboard Project Plan

## Project Overview
Build a simple admin dashboard for managing PRMT data submissions with authentication, data viewing, and approval functionality.

## Technology Stack
- **Frontend Framework**: Vue 3 (with Vite for fast development)
- **Package Manager**: Bun
- **Backend/Database**: PocketBase (already hosted at https://pb-prmt.resourcetrackr.com)
- **Styling**: Tailwind CSS
- **HTTP Client**: PocketBase JavaScript SDK
- **Routing**: Vue Router
- **State Management**: Pinia
- **Notifications**: vue3-toastify
- **Date Formatting**: date-fns
- **Primary Color**: #09cbc0
- **Secondary Color**: #20355a

## Project Structure
```
prmt-admin/
├── src/
│   ├── components/
│   │   ├── Auth/
│   │   │   └── LoginForm.vue
│   │   ├── Layout/
│   │   │   └── DashboardLayout.vue
│   │   ├── Submissions/
│   │   │   ├── SubmissionsTable.vue
│   │   │   └── ViewRecordModal.vue
│   │   └── UI/
│   │       ├── Button.vue
│   │       ├── Input.vue
│   │       ├── Modal.vue
│   │       ├── Table.vue
│   │       └── FilterDropdown.vue
│   ├── composables/
│   │   ├── usePocketBase.js
│   │   └── useToast.js
│   ├── router/
│   │   └── index.js
│   ├── stores/
│   │   └── auth.js
│   ├── lib/
│   │   └── pocketbase.js
│   ├── pages/
│   │   ├── Login.vue
│   │   └── Submissions.vue
│   ├── utils/
│   │   └── helpers.js
│   ├── App.vue
│   ├── main.js
│   └── index.css
├── public/
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── .env
├── .env.example
├── .gitignore
└── plan.md
```

## Implementation Phases

### Phase 1: Project Setup
1. Initialize Vue 3 project with Vite using Bun
2. Install dependencies:
   - vue-router
   - pinia
   - pocketbase
   - tailwindcss
   - vue3-toastify
   - date-fns
3. Configure PocketBase connection
4. Set up basic project structure
5. Configure Tailwind CSS with custom color scheme
6. Set up environment variables (.env file)

### Phase 2: Authentication System
1. Create PocketBase utility configuration
2. Implement Pinia auth store for state management
3. Build LoginForm component with email and password fields
4. Create login page with form validation (email format check, required fields)
5. Implement authentication flow:
    - Login with email/password using PocketBase `collection('users').authWithPassword()`
    - Store auth token in localStorage
    - Store user data in Pinia store
    - Logout functionality (clears token from localStorage and Pinia store, redirects to /login)
    - Protected routes (redirect to /login if not authenticated)
    - Default route `/` redirects to `/submissions` for authenticated users

### Phase 3: Dashboard Layout
1. Create DashboardLayout component
2. Implement navigation/sidebar
3. Add header with user info and logout button
4. Apply color scheme (#09cbc0 and #20355a)
5. Ensure responsive design

### Phase 4: Submissions Page
1. Create Submissions page component
2. Implement data fetching from PocketBase
3. Build SubmissionsTable component with:
   - Pagination (default 10 records per page, user can select 10/20/25/50)
   - Loading states (spinner while fetching data)
   - Error handling with user-friendly error messages
   - Sort functionality (on Start_date_of_support and End_date_of_support only, ascending/descending toggle)
   - Global search box (searches: Partner_Name, Name_of_Funder, Organization_focal_person, Email, Phone_number, Summary_of_support)
   - Filter dropdowns: State (fetched from state collection), LGA (fetched from lga collection), Approval Status (Approved/Pending)
4. Expand relations to show state, LGA, ward, and facility names (use `name` field from relation collections)
5. Display dates in DD/MM/YYYY format
6. Display empty state when no records found
7. Add view button for each record
8. Debounce search input (300ms delay)

### Phase 5: Record View Modal
1. Create ViewRecordModal component
2. Implement modal open/close functionality (close on X button, ESC key, and clicking outside modal)
3. Fetch single record with expanded relations on open
4. Display all record fields in organized layout with sections:
   - Partner Information (Partner_Name, Partner_Type, Email, Phone_number)
   - Support Details (Name_of_Funder, Program_Area, Nature_of_Support, Start_date_of_support, End_date_of_support, Summary_of_support)
   - Geographic Coverage (State, LGA, Ward, Facility)
   - Contact Information (Organization_focal_person)
   - Approval Status (approve boolean)
5. Display array fields (Partner_Type, Program_Area, Nature_of_Support) as badges/tags
6. Add approve/unapprove toggle button (simple toggle, no audit logging)
7. Implement update functionality for approve status using `pb.collection('prmt_data').update()`
8. Show toast notifications for success/error (3 seconds duration)
9. Refresh data after status update (refetch table data)
10. Ensure responsive design (modal on all devices including mobile, max-height with scroll for long content)

### Phase 6: UI Components
1. Create reusable UI components:
    - Button component (primary, secondary variants)
    - Input component
    - Modal component
    - Table component
2. Set up vue3-toastify configuration
3. Apply consistent styling with Tailwind CSS and color scheme

### Phase 7: Testing and Refinement
1. Test authentication flow
2. Test data fetching and display
3. Test approve/unapprove functionality
4. Handle edge cases and error states
5. Optimize performance
6. Add loading spinners and transitions

## Detailed Task List

### Setup Tasks
- [ ] Initialize Vite + Vue 3 project: `bun create vite prmt-admin --template vue`
- [ ] Change to project directory: `cd prmt-admin`
- [ ] Install dependencies: `bun install`
- [ ] Install PocketBase SDK: `bun add pocketbase`
- [ ] Install Vue Router: `bun add vue-router`
- [ ] Install Pinia: `bun add pinia`
- [ ] Install Tailwind CSS: `bun add -D tailwindcss postcss autoprefixer` and `bunx tailwindcss init -p`
- [ ] Install vue3-toastify: `bun add vue3-toastify`
- [ ] Install date-fns: `bun add date-fns`
- [ ] Create directory structure (components, composables, router, stores, lib, pages, utils)
- [ ] Create router/index.js file
- [ ] Configure Tailwind CSS with custom colors (#09cbc0, #20355a) in tailwind.config.js
- [ ] Configure vue3-toastify in main.js
- [ ] Create .env file with PocketBase URL: `VITE_POCKETBASE_URL=https://pb-prmt.resourcetrackr.com`
- [ ] Create .env.example file with placeholder URL
- [ ] Add `.env` to .gitignore
- [ ] Configure ESLint and Prettier (optional)

### Authentication Tasks
- [ ] Create `src/lib/pocketbase.js` with PocketBase instance and initPocketBase function
- [ ] Create `src/stores/auth.js` for auth state management using Pinia
- [ ] Add localStorage persistence for auth token and user data
- [ ] Build `src/components/Auth/LoginForm.vue` component with email/password fields
- [ ] Create `src/pages/Login.vue` page with form validation
- [ ] Create `src/router/index.js` with routes and navigation guards
- [ ] Implement protected route wrapper in router configuration
- [ ] Add logout functionality (clear localStorage, clear Pinia store, redirect to /login)
- [ ] Load auth from localStorage on app initialization in main.js

### Layout Tasks
- [ ] Create `src/components/Layout/DashboardLayout.vue`
- [ ] Design and implement navigation sidebar
- [ ] Add header with user profile section
- [ ] Apply color scheme (#09cbc0 primary, #20355a secondary)
- [ ] Ensure mobile responsiveness

### Submissions Page Tasks
- [ ] Create `src/pages/Submissions.vue`
- [ ] Implement fetch records from 'prmt_data' collection
- [ ] Use `getList` with pagination (default 10, user selectable: 10/20/25/50)
- [ ] Expand relations: State, Lga, Ward, Facility
- [ ] Create `src/components/Submissions/SubmissionsTable.vue`
- [ ] Implement table columns with proper data mapping
- [ ] Display dates in DD/MM/YYYY format using date-fns
- [ ] Add pagination controls with page size selector
- [ ] Add global search box (searches Partner Name, Funder, Organization focal person, etc.)
- [ ] Add filter dropdowns: State, LGA, Approval Status
- [ ] Implement sorting on Start_date_of_support and End_date_of_support only
- [ ] Implement loading and error states
- [ ] Show toast notifications for actions

### Record View Tasks
- [ ] Create `src/components/Submissions/ViewRecordModal.vue`
- [ ] Implement modal open/close functionality
- [ ] Fetch single record with expanded relations
- [ ] Design record details layout with:
  - Partner Information
  - Support Details
  - Geographic Coverage
  - Contact Information
  - Approval Status
- [ ] Display dates in DD/MM/YYYY format
- [ ] Display expanded relation names instead of IDs
- [ ] Implement approve/unapprove toggle button (simple toggle, no audit logging)
- [ ] Update record approval status using PocketBase update method
- [ ] Show toast notifications for success/error
- [ ] Refresh data after status update
- [ ] Ensure modal works on all devices including mobile

### UI Component Tasks
- [ ] Configure vue3-toastify in main.js
- [ ] Create `src/components/UI/Button.vue` with variants (primary, secondary, danger) using Tailwind
- [ ] Create `src/components/UI/Input.vue` with validation support using Tailwind
- [ ] Create `src/components/UI/Modal.vue` for reusable modal functionality
- [ ] Create `src/components/UI/Table.vue` for consistent table styling
- [ ] Create `src/components/UI/FilterDropdown.vue` for filter dropdowns
- [ ] Apply color scheme (#09cbc0, #20355a) consistently across all components

### Utility Tasks
- [ ] Create `src/utils/helpers.js` with:
  - Date formatting functions (DD/MM/YYYY format using date-fns)
  - Array formatting (for displaying multiple selections as badges)
  - Status badge helper functions
- [ ] Create `src/composables/usePocketBase.js` for reusable PocketBase operations
- [ ] Create `src/composables/useToast.js` for toast notification helpers

### Styling Tasks
- [ ] Configure Tailwind CSS with custom color scheme in tailwind.config.js
- [ ] Define Tailwind theme colors: primary (#09cbc0), secondary (#20355a)
- [ ] Create global styles in `src/index.css` with Tailwind directives
- [ ] Style authentication pages using Tailwind utility classes
- [ ] Style dashboard layout with responsive design using Tailwind breakpoints
- [ ] Style submissions table with Tailwind classes
- [ ] Style modal components with Tailwind
- [ ] Ensure consistent spacing and typography using Tailwind utilities
- [ ] Add hover states and transitions using Tailwind utilities

### Error Handling Tasks
- [ ] Implement global error handling in Vue app
- [ ] Handle authentication errors
- [ ] Handle data fetching errors
- [ ] Handle update operation errors
- [ ] Display user-friendly error messages

### Performance Optimization Tasks
- [ ] Implement proper data caching
- [ ] Add debouncing for search functionality
- [ ] Optimize re-renders with computed properties and v-memo where needed
- [ ] Implement lazy loading for components

### Testing Tasks
- [ ] Test login with valid credentials (show success toast)
- [ ] Test login with invalid credentials (show error toast)
- [ ] Test logout functionality (show success toast)
- [ ] Test submissions data loading
- [ ] Test pagination with different page sizes (10/20/25/50)
- [ ] Test global search functionality
- [ ] Test filter dropdowns (State, LGA, Approval Status)
- [ ] Test sort functionality on date columns
- [ ] Test view record modal
- [ ] Test approve/unapprove functionality (show success/error toast)
- [ ] Test data refresh after update
- [ ] Test toast notifications for various actions
- [ ] Test error scenarios (show error toasts)
- [ ] Test responsive design on mobile devices

## PocketBase Collection References

### Collections to Interact With:
1. **users** - Authentication collection (default PocketBase users collection)
2. **prmt_data** - Main data collection
3. **state** - State names (expanded relation, field to use: `name`)
4. **lga** - Local Government Area names (expanded relation, field to use: `name`)
5. **ward** - Ward names (expanded relation, field to use: `name`)
6. **facility** - Facility names (expanded relation, field to use: `name`)

### PocketBase Expand Syntax
When fetching records from `prmt_data` collection, use expand to get relation names:
```javascript
const expand = 'State,Lga,Ward,Facility'

// Access expanded data
const stateName = record.expand.State?.name
const lgaName = record.expand.Lga?.name
const wardName = record.expand.Ward?.name
const facilityName = record.expand.Facility?.name
```

### Key Fields in prmt_data:
- Email
- Start_date_of_support
- End_date_of_support
- Facility (relation)
- Lga (relation)
- Name_of_Funder
- Nature_of_Support (array)
- Organization_focal_person
- Partner_Name
- Partner_Type (array)
- Phone_number
- Program_Area (array)
- State (relation)
- Summary_of_support
- Ward (relation)
- approve (boolean)

### Submissions Table Columns
1. **Partner Name** - `Partner_Name` field
2. **Funder** - `Name_of_Funder` field
3. **State** - Expanded relation `State.name`
4. **LGA** - Expanded relation `Lga.name`
5. **Start Date** - `Start_date_of_support` (formatted DD/MM/YYYY, sortable)
6. **End Date** - `End_date_of_support` (formatted DD/MM/YYYY, sortable)
7. **Status** - `approve` (display as Approved/Pending badge)
8. **Actions** - View button to open modal

## Design Considerations

1. **Color Scheme Application**:
    - Primary (#09cbc0): Main actions, buttons, highlights (configured in Tailwind)
    - Secondary (#20355a): Backgrounds, text, headers (configured in Tailwind)

2. **User Experience**:
    - Clear navigation flow (sidebar navigation)
    - Loading states for all async operations (spinner overlay)
    - Toast notifications for all actions (login, logout, approval changes, errors) - 3 seconds duration, top-right position
    - Empty state message when no records found
    - Modal close on ESC key and clicking outside

3. **Data Display**:
    - Format dates in DD/MM/YYYY format using date-fns
    - Display array fields as badges/tags (Partner_Type, Program_Area, Nature_of_Support)
    - Show expanded relation names from `name` field, not IDs
    - Pagination for large datasets (default 10, user selectable: 10/20/25/50)
    - Sort only on date columns (Start_date_of_support, End_date_of_support) with ascending/descending toggle

4. **Search and Filter**:
    - Global search box searches: Partner_Name, Name_of_Funder, Organization_focal_person, Email, Phone_number, Summary_of_support
    - State filter: Fetch all states from `state` collection, sorted alphabetically
    - LGA filter: Fetch all LGAs from `lga` collection, sorted alphabetically
    - Approval Status filter: Options are "Approved", "Pending", "All"
    - Debounce search input (300ms delay) for performance
    - Clear filters button to reset all filters

5. **Error Messages**:
    - Login failed: "Invalid email or password"
    - Network error: "Connection error. Please check your internet connection"
    - Update failed: "Failed to update record. Please try again"
    - Fetch failed: "Failed to load data. Please try again"
    - General error: "An error occurred. Please try again later"

6. **Success Messages**:
    - Login success: "Login successful"
    - Logout success: "Logged out successfully"
    - Approval update success: "Record status updated successfully"

7. **Accessibility**:
    - Proper ARIA labels on all interactive elements
    - Keyboard navigation (tab, enter, escape keys)
    - Color contrast compliance (WCAG AA standards)
    - Screen reader friendly (alt text, semantic HTML)

8. **Responsiveness**:
    - Modal works on all devices including mobile (full-screen on mobile)
    - Responsive table design with Tailwind breakpoints (scrollable horizontally on small screens)
    - Sidebar collapses to hamburger menu on mobile

9. **Vue 3 Specific Considerations**:
    - Use Composition API for better code organization
    - Leverage `<script setup>` syntax for cleaner components
    - Use reactive and ref for reactive state
    - Utilize computed properties for derived state
    - Use lifecycle hooks (onMounted, onUnmounted) appropriately
    - Implement proper prop validation with TypeScript-style definitions

## Environment Configuration

Create `.env` file in project root:
```env
VITE_POCKETBASE_URL=https://pb-prmt.resourcetrackr.com
```

Create `.env.example` file (commit to git):
```env
VITE_POCKETBASE_URL=https://your-pocketbase-url.com
```

Add `.env` to `.gitignore` (never commit actual env file with secrets)

Use in PocketBase configuration:
```javascript
// lib/pocketbase.js
import PocketBase from 'pocketbase'

const pb = new PocketBase(import.meta.env.VITE_POCKETBASE_URL)

// Load auth from storage on init
export function initPocketBase() {
  const stored = localStorage.getItem('pb_auth')
  if (stored) {
    const authData = JSON.parse(stored)
    pb.authStore.save(authData.token, authData.user)
  }
}

export default pb
```

Update `main.js` to initialize PocketBase:
```javascript
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import Toast from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'
import pb, { initPocketBase } from './lib/pocketbase'
import { useAuthStore } from './stores/auth'

import './index.css'

// Initialize PocketBase auth
initPocketBase()

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(Toast, {
  autoClose: 3000,
  position: 'top-right',
  theme: 'light',
})

// Load auth from storage
const authStore = useAuthStore()
authStore.loadFromStorage()

app.mount('#app')
```

## Success Criteria

1. User can successfully login with valid credentials (with toast notification)
2. Dashboard displays submissions table with proper data
3. Expanded relations show actual names, not IDs
4. User can view full record details in modal
5. User can toggle approval status (with toast notification)
6. Changes are persisted to PocketBase
7. Pagination works with default 10 records, user can select 10/20/25/50
8. Global search box searches across multiple fields
9. Filter dropdowns work for State, LGA, and Approval Status
10. Sort works on date columns only
11. Dates display in DD/MM/YYYY format
12. Toast notifications appear for all actions
13. UI is responsive and visually appealing
14. Modal works on mobile devices
15. Error handling is robust
16. Performance is acceptable
17. Code is maintainable and well-documented

## Estimated Timeline
- Setup: 0.5 day
- Authentication: 1-1.5 days
- Dashboard Layout: 0.5 day
- Submissions Page: 1.5-2 days
- Record View Modal: 1.5 days
- UI Components: 1 day
- Testing & Refinement: 1.5-2 days

**Total Estimated Time: 7-9 days**

## Next Steps
1. Review and approve this plan
2. Confirm any missing requirements
3. Begin Phase 1: Project Setup
4. Set up development environment
5. Start implementing authentication system

## File References

### .gitignore
```
# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

node_modules
dist
dist-ssr
*.local

# Environment variables
.env
.env.local
.env.production
.env.staging

# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?
```

### postcss.config.js
```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

### vite.config.js
```javascript
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
```

## Vue 3 Implementation Notes

### Component Structure
```vue
<script setup>
// Import statements
import { ref, reactive, computed, onMounted } from 'vue'

// Props definition
const props = defineProps({
  // prop definitions
})

// Emits definition
const emit = defineEmits(['event-name'])

// Reactive state
const state = reactive({})

// Computed properties
const computedValue = computed(() => {})

// Methods
const methodName = () => {}

// Lifecycle hooks
onMounted(() => {})
</script>

<template>
  <!-- Template content -->
</template>

<style scoped>
/* Component styles */
</style>
```

### Router Setup
```javascript
// router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/pages/Login.vue'),
    meta: { guestOnly: true }
  },
  {
    path: '/',
    name: 'Dashboard',
    component: () => import('@/components/Layout/DashboardLayout.vue'),
    meta: { requiresAuth: true },
    redirect: '/submissions',
    children: [
      {
        path: 'submissions',
        name: 'Submissions',
        component: () => import('@/pages/Submissions.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard for auth
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  // Redirect authenticated users away from login
  if (to.meta.guestOnly && authStore.isAuthenticated) {
    next('/submissions')
  }
  // Require auth for protected routes
  else if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  }
  // Allow navigation
  else {
    next()
  }
})

export default router
```

### Pinia Store Setup
```javascript
// stores/auth.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import pb from '@/lib/pocketbase'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(null)

  const isAuthenticated = computed(() => !!token.value)

  function setAuth(userData) {
    user.value = userData
    token.value = userData.token
    // Store auth data in localStorage
    localStorage.setItem('pb_auth', JSON.stringify({
      token: userData.token,
      user: userData.record
    }))
  }

  function clearAuth() {
    user.value = null
    token.value = null
    // Clear auth data from localStorage
    localStorage.removeItem('pb_auth')
    // Clear PocketBase auth store
    pb.authStore.clear()
  }

  function loadFromStorage() {
    const stored = localStorage.getItem('pb_auth')
    if (stored) {
      const authData = JSON.parse(stored)
      token.value = authData.token
      user.value = authData.user
      // Restore PocketBase auth
      pb.authStore.save(authData.token, authData.user)
    }
  }

  return {
    user,
    token,
    isAuthenticated,
    setAuth,
    clearAuth,
    loadFromStorage
  }
})
```

### Tailwind Configuration
```javascript
// tailwind.config.js
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#09cbc0',
        secondary: '#20355a',
      },
    },
  },
  plugins: [],
}
```

### Toast Configuration (main.js)
```javascript
import { createApp } from 'vue'
import App from './App.vue'
import Toast from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'

const app = createApp(App)

app.use(Toast, {
  autoClose: 3000,
  position: 'top-right',
  theme: 'light',
})

app.mount('#app')
```

### Date Formatting Helper
```javascript
// utils/helpers.js
import { format } from 'date-fns'

export function formatDate(dateString) {
  if (!dateString) return 'N/A'
  return format(new Date(dateString), 'dd/MM/yyyy')
}

export function formatArray(arr) {
  if (!arr || !Array.isArray(arr)) return []
  return arr
}

export function getRelationName(relation) {
  return relation?.name || 'N/A'
}

export function getBadgeClass(status) {
  return status ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
}

export function getStatusText(status) {
  return status ? 'Approved' : 'Pending'
}
```

### Toast Composable
```javascript
// composables/useToast.js
import { toast } from 'vue3-toastify'

export function useToast() {
  const showSuccess = (message) => {
    toast.success(message, {
      autoClose: 3000,
      position: 'top-right',
      theme: 'light',
    })
  }

  const showError = (message) => {
    toast.error(message, {
      autoClose: 3000,
      position: 'top-right',
      theme: 'light',
    })
  }

  return {
    showSuccess,
    showError
  }
}
```

### PocketBase Composable
```javascript
// composables/usePocketBase.js
import { ref } from 'vue'
import pb from '@/lib/pocketbase'
import { useToast } from './useToast'

export function usePocketBase() {
  const { showError } = useToast()
  const loading = ref(false)
  const error = ref(null)

  async function fetchRecords(collection, options = {}) {
    loading.value = true
    error.value = null
    try {
      const result = await pb.collection(collection).getList(options.page, options.perPage, {
        expand: options.expand || '',
        filter: options.filter || '',
        sort: options.sort || ''
      })
      return result
    } catch (err) {
      error.value = err.message
      showError('Failed to load data. Please try again')
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateRecord(collection, id, data) {
    loading.value = true
    error.value = null
    try {
      const result = await pb.collection(collection).update(id, data)
      return result
    } catch (err) {
      error.value = err.message
      showError('Failed to update record. Please try again')
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    fetchRecords,
    updateRecord
  }
}
```

### FilterDropdown Component Example
```vue
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
  }
})

const emit = defineEmits(['update:modelValue'])

const localValue = ref(props.modelValue)

watch(localValue, (newValue) => {
  emit('update:modelValue', newValue)
})

watch(() => props.modelValue, (newValue) => {
  localValue.value = newValue
})

const displayValue = computed(() => {
  const option = props.options.find(opt => opt.value === localValue.value)
  return option ? option.label : 'All'
})
</script>

<template>
  <div class="relative">
    <label class="block text-sm font-medium text-secondary mb-1">{{ label }}</label>
    <select
      v-model="localValue"
      class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
    >
      <option value="">All</option>
      <option v-for="option in options" :key="option.value" :value="option.value">
        {{ option.label }}
      </option>
    </select>
  </div>
</template>
```
