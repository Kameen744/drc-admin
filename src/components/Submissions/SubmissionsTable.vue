<script setup>
import { ref, computed, watch } from "vue";
import Table from "@/components/UI/Table.vue";
import FilterDropdown from "@/components/UI/FilterDropdown.vue";
import Button from "@/components/UI/Button.vue";
import Badge from "@/components/UI/Badge.vue";
import { formatDate, getBadgeClass, getStatusText, extractFromArray } from "@/utils/helpers";
import { usePocketBase } from "@/composables/usePocketBase";

const props = defineProps({
    records: {
        type: Array,
        required: true,
    },
    loading: {
        type: Boolean,
        default: false,
    },
    pagination: {
        type: Object,
        required: true,
    },
});

const emit = defineEmits([
    "view",
    "page-change",
    "per-page-change",
    "filter-change",
    "sort-change",
]);

const localSearch = ref("");
const localStateFilter = ref("");
const localLgaFilter = ref("");
const localApprovalFilter = ref("");
const sortColumn = ref("");
const sortDirection = ref("asc");

let searchTimeout = null;

watch(localSearch, (newValue) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        emit("filter-change", {
            search: newValue,
            state: localStateFilter.value,
            lga: localLgaFilter.value,
            approval: localApprovalFilter.value,
            sortColumn: sortColumn.value,
            sortDirection: sortDirection.value,
        });
    }, 300);
});

watch([localStateFilter, localLgaFilter, localApprovalFilter], () => {
    emit("filter-change", {
        search: localSearch.value,
        state: localStateFilter.value,
        lga: localLgaFilter.value,
        approval: localApprovalFilter.value,
        sortColumn: sortColumn.value,
        sortDirection: sortDirection.value,
    });
});

function handleSort({ column, direction }) {
    sortColumn.value = column;
    sortDirection.value = direction;
    emit("sort-change", { column, direction });
}

const columns = [
    { key: "Partner_Name", label: "Partner Name" },
    { key: "Name_of_Funder", label: "Funder" },
    { key: "stateName", label: "State" },
    { key: "lgaName", label: "LGA" },
    { key: "Start_date_of_support", label: "Start Date", sortable: true },
    { key: "End_date_of_support", label: "End Date", sortable: true },
    { key: "status", label: "Status" },
    { key: "actions", label: "Actions" },
];

const stateOptions = computed(() => {
    const uniqueStates = [
        ...new Set(props.records.flatMap((r) => r.state_names || []).filter(Boolean)),
    ];
    return [
        { value: "", label: "All States" },
        ...uniqueStates.map((s) => ({ value: s, label: s })),
    ];
});

const lgaOptions = computed(() => {
    const allLGAs = props.records
        .flatMap((r) => extractFromArray(r.lga_data, "lga"))
        .filter(Boolean);
    const uniqueLGAs = [...new Set(allLGAs)];
    return [
        { value: "", label: "All LGAs" },
        ...uniqueLGAs.map((l) => ({ value: l, label: l })),
    ];
});

const approvalOptions = [
    { value: "", label: "All Statuses" },
    { value: "true", label: "Approved" },
    { value: "false", label: "Pending" },
];

const perPageOptions = [10, 20, 25, 50];

function handleView(record) {
    emit("view", record);
}

function clearFilters() {
    localSearch.value = "";
    localStateFilter.value = "";
    localLgaFilter.value = "";
    localApprovalFilter.value = "";
}

const hasActiveFilters = computed(() => {
    return localSearch.value || localStateFilter.value || localLgaFilter.value || localApprovalFilter.value;
});
</script>

<template>
    <div class="space-y-5">
        <!-- Search and Filters -->
        <div class="bg-gray-50 rounded-lg p-4 space-y-4">
            <!-- Search input -->
            <div class="relative">
                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </span>
                <input
                    v-model="localSearch"
                    type="text"
                    placeholder="Search by partner name, funder, email, phone, or summary..."
                    class="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-sm"
                />
                <button
                    v-if="localSearch"
                    @click="localSearch = ''"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <!-- Filter dropdowns -->
            <div class="flex flex-wrap gap-3">
                <FilterDropdown
                    label="State"
                    :options="stateOptions"
                    v-model="localStateFilter"
                />
                <FilterDropdown
                    label="LGA"
                    :options="lgaOptions"
                    v-model="localLgaFilter"
                />
                <FilterDropdown
                    label="Approval Status"
                    :options="approvalOptions"
                    v-model="localApprovalFilter"
                />
                <Button
                    v-if="hasActiveFilters"
                    @click="clearFilters"
                    variant="ghost"
                    size="sm"
                    class="self-end"
                >
                    <span>✕</span>
                    Clear Filters
                </Button>
            </div>
        </div>

        <!-- Table -->
        <Table
            :columns="columns"
            :data="records"
            :sort-column="sortColumn"
            :sort-direction="sortDirection"
            :loading="loading"
            @sort="handleSort"
        >
            <template #Partner_Name="{ row }">
                <div class="font-medium text-gray-900">{{ row.Partner_Name }}</div>
            </template>
            <template #Name_of_Funder="{ row }">
                <span class="text-gray-700">{{ row.Name_of_Funder }}</span>
            </template>
            <template #stateName="{ row }">
                <span class="inline-flex items-center gap-1">
                    <span class="w-2 h-2 rounded-full bg-blue-400"></span>
                    {{ (row.state_names || []).join(", ") || "N/A" }}
                </span>
            </template>
            <template #lgaName="{ row }">
                <span class="text-gray-600">{{ extractFromArray(row.lga_data, "lga").join(", ") || "N/A" }}</span>
            </template>
            <template #Start_date_of_support="{ row }">
                <span class="text-gray-700">{{ formatDate(row.Start_date_of_support) }}</span>
            </template>
            <template #End_date_of_support="{ row }">
                <span class="text-gray-700">{{ formatDate(row.End_date_of_support) }}</span>
            </template>
            <template #status="{ row }">
                <Badge
                    :variant="row.approve ? 'success' : 'warning'"
                    :dot="true"
                >
                    {{ getStatusText(row.approve) }}
                </Badge>
            </template>
            <template #actions="{ row }">
                <Button
                    @click="handleView(row)"
                    variant="outline-primary"
                    size="sm"
                >
                    👁️ View
                </Button>
            </template>
        </Table>

        <!-- Pagination -->
        <div
            class="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-gray-200"
        >
            <div class="flex items-center gap-2 text-sm text-gray-600">
                <span>Showing</span>
                <select
                    :value="pagination.perPage"
                    @change="$emit('per-page-change', $event.target.value)"
                    class="px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white"
                >
                    <option
                        v-for="option in perPageOptions"
                        :key="option"
                        :value="option"
                    >
                        {{ option }}
                    </option>
                </select>
                <span>per page</span>
            </div>

            <div class="flex items-center gap-2">
                <Button
                    @click="$emit('page-change', pagination.page - 1)"
                    :disabled="pagination.page <= 1"
                    variant="outline-secondary"
                    size="sm"
                >
                    ← Previous
                </Button>
                <span class="text-sm text-gray-600 px-2">
                    Page <strong>{{ pagination.page }}</strong> of
                    <strong>{{ pagination.totalPages || 1 }}</strong>
                </span>
                <Button
                    @click="$emit('page-change', pagination.page + 1)"
                    :disabled="pagination.page >= pagination.totalPages"
                    variant="outline-secondary"
                    size="sm"
                >
                    Next →
                </Button>
            </div>
        </div>
    </div>
</template>
