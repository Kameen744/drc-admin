<script setup>
import { ref, onMounted, computed } from "vue";
import SubmissionsTable from "@/components/Submissions/SubmissionsTable.vue";
import ViewRecordModal from "@/components/Submissions/ViewRecordModal.vue";
import Card from "@/components/UI/Card.vue";
import Button from "@/components/UI/Button.vue";
import { usePocketBase } from "@/composables/usePocketBase";

const { fetchRecords } = usePocketBase();

const loading = ref(false);
const error = ref(null);
const records = ref([]);

const pagination = ref({
    page: 1,
    perPage: 10,
    totalItems: 0,
    totalPages: 0,
});

const selectedRecordId = ref("");
const modalOpen = ref(false);

const filters = ref({
    search: "",
    state: "",
    lga: "",
    approval: "",
    sortColumn: "",
    sortDirection: "asc",
});

// Stats
const stats = computed(() => {
    const total = records.value.length || 0;
    const approved = records.value.filter(r => r.approve).length || 0;
    const pending = total - approved;
    const uniqueStates = new Set(records.value.map(r => r.state_name).filter(Boolean)).size;

    return {
        total,
        approved,
        pending,
        uniqueStates
    };
});

function buildFilter() {
    let filterParts = [];

    if (filters.value.search) {
        const searchFields = [
            `Partner_Name ~ "${filters.value.search}"`,
            `Name_of_Funder ~ "${filters.value.search}"`,
            `Organization_focal_person ~ "${filters.value.search}"`,
            `Email ~ "${filters.value.search}"`,
            `Phone_number ~ "${filters.value.search}"`,
            `Summary_of_support ~ "${filters.value.search}"`,
        ];
        filterParts.push(`(${searchFields.join(" || ")})`);
    }

    if (filters.value.state) {
        filterParts.push(`state_name = "${filters.value.state}"`);
    }

    if (filters.value.lga) {
        filterParts.push(`lga_names ~ "${filters.value.lga}"`);
    }

    if (filters.value.approval !== "") {
        filterParts.push(`approve = ${filters.value.approval}`);
    }

    return filterParts.join(" && ");
}

async function fetchSubmissions() {
    loading.value = true;
    error.value = null;
    try {
        const filter = buildFilter();
        const sort = filters.value.sortColumn
            ? `${filters.value.sortDirection === "asc" ? "" : "-"}${filters.value.sortColumn}`
            : "";

        const result = await fetchRecords("prmt_data_view", {
            page: pagination.value.page,
            perPage: pagination.value.perPage,
            filter,
            sort,
        });

        records.value = result.items;
        pagination.value.totalItems = result.totalItems;
        pagination.value.totalPages = result.totalPages;
    } catch (err) {
        console.error("Error fetching submissions:", err);
        error.value =
            err.message || "Failed to load submissions. Please try again.";
        records.value = [];
    } finally {
        loading.value = false;
    }
}

function handlePageChange(page) {
    pagination.value.page = page;
    fetchSubmissions();
}

function handlePerPageChange(perPage) {
    pagination.value.perPage = parseInt(perPage);
    pagination.value.page = 1;
    fetchSubmissions();
}

function handleFilterChange(newFilters) {
    filters.value = { ...filters.value, ...newFilters };
    pagination.value.page = 1;
    fetchSubmissions();
}

function handleSortChange({ column, direction }) {
    filters.value.sortColumn = column;
    filters.value.sortDirection = direction;
    fetchSubmissions();
}

function handleViewRecord(record) {
    selectedRecordId.value = record.id;
    modalOpen.value = true;
}

function handleModalUpdated() {
    fetchSubmissions();
}

function retryFetch() {
    fetchSubmissions();
}

onMounted(async () => {
    try {
        await fetchSubmissions();
    } catch (err) {
        console.error("Error during initial load:", err);
        error.value = "Failed to load initial data. Please refresh the page.";
    }
});
</script>

<template>
    <div class="space-y-6">
        <!-- Page Header -->
        <div>
            <h1 class="text-2xl font-bold text-secondary">PRMT Submissions</h1>
            <p class="text-gray-600 mt-1">
                View and manage PRMT data submissions
            </p>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card variant="elevated" padding="md" class="hover:scale-[1.02] transition-transform duration-200">
                <div class="flex items-center gap-4">
                    <div class="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <span class="text-2xl">📊</span>
                    </div>
                    <div>
                        <p class="text-sm text-gray-500 font-medium">Total Submissions</p>
                        <p class="text-2xl font-bold text-gray-900">{{ pagination.totalItems }}</p>
                    </div>
                </div>
            </Card>

            <Card variant="elevated" padding="md" class="hover:scale-[1.02] transition-transform duration-200">
                <div class="flex items-center gap-4">
                    <div class="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                        <span class="text-2xl">✅</span>
                    </div>
                    <div>
                        <p class="text-sm text-gray-500 font-medium">Approved</p>
                        <p class="text-2xl font-bold text-green-600">{{ stats.approved }}</p>
                    </div>
                </div>
            </Card>

            <Card variant="elevated" padding="md" class="hover:scale-[1.02] transition-transform duration-200">
                <div class="flex items-center gap-4">
                    <div class="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center">
                        <span class="text-2xl">⏳</span>
                    </div>
                    <div>
                        <p class="text-sm text-gray-500 font-medium">Pending</p>
                        <p class="text-2xl font-bold text-yellow-600">{{ stats.pending }}</p>
                    </div>
                </div>
            </Card>

            <Card variant="elevated" padding="md" class="hover:scale-[1.02] transition-transform duration-200">
                <div class="flex items-center gap-4">
                    <div class="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                        <span class="text-2xl">🗺️</span>
                    </div>
                    <div>
                        <p class="text-sm text-gray-500 font-medium">States Covered</p>
                        <p class="text-2xl font-bold text-blue-600">{{ stats.uniqueStates }}</p>
                    </div>
                </div>
            </Card>
        </div>

        <!-- Error State -->
        <Transition
            enter-active-class="transition-all duration-300"
            enter-from-class="opacity-0 translate-y-2"
            enter-to-class="opacity-100 translate-y-0"
        >
            <Card
                v-if="error"
                variant="bordered"
                padding="md"
                class="bg-red-50 border-red-200"
            >
                <div class="flex items-start gap-3">
                    <div class="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                        <svg class="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div class="flex-1">
                        <h3 class="font-semibold text-red-900">Error Loading Data</h3>
                        <p class="text-red-700 mt-1">{{ error }}</p>
                        <Button @click="retryFetch" variant="danger" size="sm" class="mt-3">
                            <span>🔄</span>
                            Retry
                        </Button>
                    </div>
                </div>
            </Card>
        </Transition>

        <!-- Table -->
        <Card variant="elevated" padding="lg">
            <SubmissionsTable
                :records="records"
                :loading="loading"
                :pagination="pagination"
                @view="handleViewRecord"
                @page-change="handlePageChange"
                @per-page-change="handlePerPageChange"
                @filter-change="handleFilterChange"
                @sort-change="handleSortChange"
            />
        </Card>

        <!-- View Record Modal -->
        <ViewRecordModal
            :open="modalOpen"
            :record-id="selectedRecordId"
            @close="modalOpen = false"
            @updated="handleModalUpdated"
        />
    </div>
</template>
