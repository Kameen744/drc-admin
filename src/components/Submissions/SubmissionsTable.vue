<script setup>
import { ref, computed, watch, onMounted } from "vue";
import Table from "@/components/UI/Table.vue";
import FilterDropdown from "@/components/UI/FilterDropdown.vue";
import Button from "@/components/UI/Button.vue";
import Badge from "@/components/UI/Badge.vue";
import { formatDate, getBadgeClass, extractFromArray, extractProgramAreaNames } from "@/utils/helpers";
import { usePocketBase } from "@/composables/usePocketBase";
import { t } from "@/i18n";

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
    lockedState: {
        type: String,
        default: "",
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

// Auto-set province filter when locked (province admin)
const stateLocked = computed(() => !!props.lockedState);

onMounted(() => {
    if (props.lockedState) {
        localStateFilter.value = props.lockedState;
    }
});

watch(() => props.lockedState, (val) => {
    if (val) {
        localStateFilter.value = val;
    }
});

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

const columns = computed(() => [
    { key: "Partner_Name", label: t("table.partnerName") },
    { key: "Name_of_Funder", label: t("table.funder") },
    { key: "Program_Area", label: t("table.programAreas") },
    { key: "stateName", label: t("table.province") },
    { key: "lgaName", label: t("table.territory") },
    { key: "Start_date_of_support", label: t("table.startDate"), sortable: true },
    { key: "End_date_of_support", label: t("table.endDate"), sortable: true },
    { key: "status", label: t("table.status") },
    { key: "actions", label: t("table.actions") },
]);

const stateOptions = computed(() => {
    const uniqueStates = [
        ...new Set(props.records.flatMap((r) => r.state_names || []).filter(Boolean)),
    ];
    return [
        { value: "", label: t("table.allProvinces") },
        ...uniqueStates.map((s) => ({ value: s, label: s })),
    ];
});

const lgaOptions = computed(() => {
    const allLGAs = props.records
        .flatMap((r) => extractFromArray(r.lga_data, "territory"))
        .filter(Boolean);
    const uniqueLGAs = [...new Set(allLGAs)];
    return [
        { value: "", label: t("table.allTerritories") },
        ...uniqueLGAs.map((l) => ({ value: l, label: l })),
    ];
});

const approvalOptions = computed(() => [
    { value: "", label: t("table.allStatuses") },
    { value: "true", label: t("table.approved") },
    { value: "false", label: t("table.pending") },
]);

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
                    :placeholder="t('table.searchPlaceholder')"
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
                    :label="t('filter.province')"
                    :options="stateOptions"
                    v-model="localStateFilter"
                    :disabled="stateLocked"
                />
                <FilterDropdown
                    :label="t('filter.territory')"
                    :options="lgaOptions"
                    v-model="localLgaFilter"
                />
                <FilterDropdown
                    :label="t('filter.approvalStatus')"
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
                    {{ t("table.clearFilters") }}
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
                <div class="font-medium text-gray-900 truncate" :title="row.Partner_Name">{{ row.Partner_Name }}</div>
            </template>
            <template #Name_of_Funder="{ row }">
                <span class="text-gray-700 truncate block" :title="row.Name_of_Funder">{{ row.Name_of_Funder }}</span>
            </template>
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
            <template #stateName="{ row }">
                <div v-if="(row.state_names || []).length" class="flex flex-wrap gap-1 items-center">
                    <span
                        v-for="state in (row.state_names || []).slice(0, 2)"
                        :key="state"
                        class="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 rounded px-1.5 py-0.5"
                    >
                        <span class="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                        {{ state }}
                    </span>
                    <span
                        v-if="(row.state_names || []).length > 2"
                        class="text-xs text-gray-500 bg-gray-100 rounded px-1.5 py-0.5 cursor-help"
                        :title="(row.state_names || []).join(', ')"
                    >
                        +{{ (row.state_names || []).length - 2 }} {{ t("app.more") }}
                    </span>
                </div>
                <span v-else class="text-gray-400">{{ t("app.na") }}</span>
            </template>
            <template #lgaName="{ row }">
                <div v-if="extractFromArray(row.lga_data, 'territory').length" class="flex flex-wrap gap-1 items-center">
                    <span
                        v-for="lga in extractFromArray(row.lga_data, 'territory').slice(0, 2)"
                        :key="lga"
                        class="text-xs bg-gray-100 text-gray-700 rounded px-1.5 py-0.5"
                    >
                        {{ lga }}
                    </span>
                    <span
                        v-if="extractFromArray(row.lga_data, 'territory').length > 2"
                        class="text-xs text-gray-500 bg-gray-100 rounded px-1.5 py-0.5 cursor-help"
                        :title="extractFromArray(row.lga_data, 'territory').join(', ')"
                    >
                        +{{ extractFromArray(row.lga_data, 'territory').length - 2 }} {{ t("app.more") }}
                    </span>
                </div>
                <span v-else class="text-gray-400">{{ t("app.na") }}</span>
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
                    {{ row.approve ? t("table.approved") : t("table.pending") }}
                </Badge>
            </template>
            <template #actions="{ row }">
                <Button
                    @click="handleView(row)"
                    variant="outline-primary"
                    size="sm"
                >
                    👁️ {{ t("table.view") }}
                </Button>
            </template>
        </Table>

        <!-- Pagination -->
        <div
            class="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-gray-200"
        >
            <div class="flex items-center gap-2 text-sm text-gray-600">
                <span>{{ t("table.showing") }}</span>
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
                <span>{{ t("table.perPage") }}</span>
            </div>

            <div class="flex items-center gap-2">
                <Button
                    @click="$emit('page-change', pagination.page - 1)"
                    :disabled="pagination.page <= 1"
                    variant="outline-secondary"
                    size="sm"
                >
                    ← {{ t("table.previous") }}
                </Button>
                <span class="text-sm text-gray-600 px-2">
                    {{ t("table.page") }} <strong>{{ pagination.page }}</strong> {{ t("table.of") }}
                    <strong>{{ pagination.totalPages || 1 }}</strong>
                </span>
                <Button
                    @click="$emit('page-change', pagination.page + 1)"
                    :disabled="pagination.page >= pagination.totalPages"
                    variant="outline-secondary"
                    size="sm"
                >
                    {{ t("table.next") }} →
                </Button>
            </div>
        </div>
    </div>
</template>
