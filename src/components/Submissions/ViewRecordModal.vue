<script setup>
import { ref, watch } from "vue";
import { usePocketBase } from "@/composables/usePocketBase";
import { useToast } from "@/composables/useToast";
import { formatDate, formatArray, extractFromArray } from "@/utils/helpers";
import Modal from "@/components/UI/Modal.vue";
import Button from "@/components/UI/Button.vue";
import Badge from "@/components/UI/Badge.vue";
import Card from "@/components/UI/Card.vue";

const props = defineProps({
    open: {
        type: Boolean,
        default: false,
    },
    recordId: {
        type: String,
        default: "",
    },
});

const emit = defineEmits(["close", "updated"]);

const { fetchOneRecord, updateRecord, loading } = usePocketBase();
const { showSuccess, showError } = useToast();

const record = ref(null);

async function fetchRecord() {
    if (!props.recordId) return;

    try {
        record.value = await fetchOneRecord("prmt_data_view", props.recordId);
    } catch (error) {
        console.error("Error fetching record:", error);
    }
}

watch(
    () => props.open,
    async (newValue) => {
        if (newValue && props.recordId) {
            await fetchRecord();
        }
    },
);

async function handleToggleApprove() {
    if (!record.value) return;

    try {
        const updated = await updateRecord("prmt_data", record.value.id, {
            approve: !record.value.approve,
        });
        record.value = updated;
        showSuccess("Record status updated successfully");
        emit("updated");
    } catch (error) {
        showError("Failed to update record status");
    }
}

function handleClose() {
    emit("close");
    record.value = null;
}
</script>

<template>
    <Modal :open="open" title="Record Details" size="lg" @close="handleClose">
        <template #footer>
            <Button variant="ghost" @click="handleClose"> Close </Button>
            <Button
                v-if="record"
                @click="handleToggleApprove"
                :variant="record.approve ? 'danger' : 'primary'"
                :loading="loading"
            >
                {{ record.approve ? "✕ Unapprove" : "✓ Approve" }}
            </Button>
        </template>

        <!-- Loading State -->
        <div v-if="loading && !record" class="text-center py-12">
            <div
                class="inline-block animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent"
            ></div>
            <p class="mt-4 text-gray-600">Loading record details...</p>
        </div>

        <!-- Record Content -->
        <div v-else-if="record" class="space-y-6">
            <!-- Status Banner -->
            <Card
                variant="bordered"
                padding="md"
                class="bg-gradient-to-r from-gray-50 to-blue-50 border-blue-100"
            >
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        <div
                            class="w-10 h-10 rounded-full flex items-center justify-center"
                            :class="
                                record.approve
                                    ? 'bg-green-100'
                                    : 'bg-yellow-100'
                            "
                        >
                            <span class="text-xl">{{
                                record.approve ? "✅" : "⏳"
                            }}</span>
                        </div>
                        <div>
                            <p class="text-sm text-gray-500">Approval Status</p>
                            <Badge
                                :variant="
                                    record.approve ? 'success' : 'warning'
                                "
                                size="lg"
                                :dot="true"
                            >
                                {{
                                    record.approve
                                        ? "Approved"
                                        : "Pending Review"
                                }}
                            </Badge>
                        </div>
                    </div>
                </div>
            </Card>

            <!-- Partner Information -->
            <section>
                <div class="flex items-center gap-2 mb-4">
                    <div
                        class="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"
                    >
                        <span class="text-sm">🏢</span>
                    </div>
                    <h3 class="text-lg font-semibold text-secondary">
                        Partner Information
                    </h3>
                </div>
                <Card variant="bordered" padding="lg">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="space-y-1">
                            <label
                                class="text-xs font-medium text-gray-500 uppercase tracking-wide"
                                >Partner Name</label
                            >
                            <p class="font-semibold text-gray-900">
                                {{ record.Partner_Name || "N/A" }}
                            </p>
                        </div>
                        <div class="space-y-1">
                            <label
                                class="text-xs font-medium text-gray-500 uppercase tracking-wide"
                                >Partner Type</label
                            >
                            <div class="flex flex-wrap gap-1.5 mt-1">
                                <span
                                    v-for="(type, index) in formatArray(
                                        record.Partner_Type,
                                    )"
                                    :key="index"
                                    class="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md text-sm font-medium border border-blue-100"
                                >
                                    {{ type }}
                                </span>
                                <span
                                    v-if="
                                        !record.Partner_Type ||
                                        record.Partner_Type.length === 0
                                    "
                                    class="text-gray-400"
                                    >N/A</span
                                >
                            </div>
                        </div>
                        <div class="space-y-1">
                            <label
                                class="text-xs font-medium text-gray-500 uppercase tracking-wide"
                                >Email Address</label
                            >
                            <p class="font-medium text-gray-900">
                                {{ record.Email || "N/A" }}
                            </p>
                        </div>
                        <div class="space-y-1">
                            <label
                                class="text-xs font-medium text-gray-500 uppercase tracking-wide"
                                >Phone Number</label
                            >
                            <p class="font-medium text-gray-900">
                                {{ record.Phone_number || "N/A" }}
                            </p>
                        </div>
                    </div>
                </Card>
            </section>

            <!-- Support Details -->
            <section>
                <div class="flex items-center gap-2 mb-4">
                    <div
                        class="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center"
                    >
                        <span class="text-sm">💼</span>
                    </div>
                    <h3 class="text-lg font-semibold text-secondary">
                        Support Details
                    </h3>
                </div>
                <Card variant="bordered" padding="lg">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="space-y-1">
                            <label
                                class="text-xs font-medium text-gray-500 uppercase tracking-wide"
                                >Funding Organization</label
                            >
                            <p class="font-medium text-gray-900">
                                {{ record.Name_of_Funder || "N/A" }}
                            </p>
                        </div>
                        <div class="space-y-1">
                            <label
                                class="text-xs font-medium text-gray-500 uppercase tracking-wide"
                                >Program Areas</label
                            >
                            <div class="flex flex-wrap gap-1.5 mt-1">
                                <span
                                    v-for="(area, index) in formatArray(
                                        record.Program_Area,
                                    )"
                                    :key="index"
                                    class="px-2.5 py-1 bg-green-50 text-green-700 rounded-md text-sm font-medium border border-green-100"
                                >
                                    {{ area }}
                                </span>
                                <span
                                    v-if="
                                        !record.Program_Area ||
                                        record.Program_Area.length === 0
                                    "
                                    class="text-gray-400"
                                    >N/A</span
                                >
                            </div>
                        </div>
                        <div class="space-y-1">
                            <label
                                class="text-xs font-medium text-gray-500 uppercase tracking-wide"
                                >Nature of Support</label
                            >
                            <div class="flex flex-wrap gap-1.5 mt-1">
                                <span
                                    v-for="(support, index) in formatArray(
                                        record.Nature_of_Support,
                                    )"
                                    :key="index"
                                    class="px-2.5 py-1 bg-purple-50 text-purple-700 rounded-md text-sm font-medium border border-purple-100"
                                >
                                    {{ support }}
                                </span>
                                <span
                                    v-if="
                                        !record.Nature_of_Support ||
                                        record.Nature_of_Support.length === 0
                                    "
                                    class="text-gray-400"
                                    >N/A</span
                                >
                            </div>
                        </div>
                        <div class="space-y-1">
                            <label
                                class="text-xs font-medium text-gray-500 uppercase tracking-wide"
                                >Start Date</label
                            >
                            <p class="font-medium text-gray-900">
                                {{ formatDate(record.Start_date_of_support) }}
                            </p>
                        </div>
                        <div class="space-y-1">
                            <label
                                class="text-xs font-medium text-gray-500 uppercase tracking-wide"
                                >End Date</label
                            >
                            <p class="font-medium text-gray-900">
                                {{ formatDate(record.End_date_of_support) }}
                            </p>
                        </div>
                        <div class="md:col-span-2 space-y-1">
                            <label
                                class="text-xs font-medium text-gray-500 uppercase tracking-wide"
                                >Summary of Support</label
                            >
                            <p
                                class="font-medium text-gray-900 leading-relaxed"
                            >
                                {{ record.Summary_of_support || "N/A" }}
                            </p>
                        </div>
                    </div>
                </Card>
            </section>

            <!-- Geographic Coverage -->
            <section>
                <div class="flex items-center gap-2 mb-4">
                    <div
                        class="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center"
                    >
                        <span class="text-sm">🗺️</span>
                    </div>
                    <h3 class="text-lg font-semibold text-secondary">
                        Geographic Coverage
                    </h3>
                </div>
                <Card variant="bordered" padding="lg">
                    <div class="grid grid-cols-1 gap-4">
                        <div class="space-y-1">
                            <label
                                class="text-xs font-medium text-gray-500 uppercase tracking-wide"
                                >State(s)</label
                            >
                            <div class="flex flex-wrap gap-1.5 mt-1">
                                <span
                                    v-for="(state, index) in (record.state_names || [])"
                                    :key="index"
                                    class="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md text-sm font-medium border border-blue-100"
                                >
                                    {{ state }}
                                </span>
                                <span
                                    v-if="!record.state_names || record.state_names.length === 0"
                                    class="text-gray-400"
                                    >N/A</span
                                >
                            </div>
                        </div>
                        <div class="space-y-1">
                            <label
                                class="text-xs font-medium text-gray-500 uppercase tracking-wide"
                                >Local Government Areas (LGAs)</label
                            >
                            <div class="flex flex-wrap gap-1.5 mt-1">
                                <span
                                    v-for="(lga, index) in extractFromArray(
                                        record.lga_data, 'lga',
                                    )"
                                    :key="index"
                                    class="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md text-sm font-medium border border-blue-100"
                                >
                                    {{ lga }}
                                </span>
                                <span
                                    v-if="
                                        !record.lga_data ||
                                        record.lga_data.length === 0
                                    "
                                    class="text-gray-400"
                                    >N/A</span
                                >
                            </div>
                        </div>
                        <div class="space-y-1">
                            <label
                                class="text-xs font-medium text-gray-500 uppercase tracking-wide"
                                >Wards</label
                            >
                            <div class="flex flex-wrap gap-1.5 mt-1">
                                <span
                                    v-for="(ward, index) in extractFromArray(
                                        record.ward_data, 'ward',
                                    )"
                                    :key="index"
                                    class="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-md text-sm font-medium border border-indigo-100"
                                >
                                    {{ ward }}
                                </span>
                                <span
                                    v-if="
                                        !record.ward_data ||
                                        record.ward_data.length === 0
                                    "
                                    class="text-gray-400"
                                    >N/A</span
                                >
                            </div>
                        </div>
                        <div class="space-y-1">
                            <label
                                class="text-xs font-medium text-gray-500 uppercase tracking-wide"
                                >Facilities</label
                            >
                            <div class="flex flex-wrap gap-1.5 mt-1">
                                <span
                                    v-for="(facility, index) in extractFromArray(
                                        record.facility_data, 'facility',
                                    )"
                                    :key="index"
                                    class="px-2.5 py-1 bg-teal-50 text-teal-700 rounded-md text-sm font-medium border border-teal-100"
                                >
                                    {{ facility }}
                                </span>
                                <span
                                    v-if="
                                        !record.facility_data ||
                                        record.facility_data.length === 0
                                    "
                                    class="text-gray-400"
                                    >N/A</span
                                >
                            </div>
                        </div>
                    </div>
                </Card>
            </section>

            <!-- Contact Information -->
            <section>
                <div class="flex items-center gap-2 mb-4">
                    <div
                        class="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center"
                    >
                        <span class="text-sm">👤</span>
                    </div>
                    <h3 class="text-lg font-semibold text-secondary">
                        Contact Information
                    </h3>
                </div>
                <Card variant="bordered" padding="lg">
                    <div class="space-y-1">
                        <label
                            class="text-xs font-medium text-gray-500 uppercase tracking-wide"
                            >Organization Focal Person</label
                        >
                        <p class="font-medium text-gray-900">
                            {{ record.Organization_focal_person || "N/A" }}
                        </p>
                    </div>
                </Card>
            </section>
        </div>

        <!-- No Data State -->
        <div v-else class="text-center py-12">
            <div class="text-5xl mb-4">📭</div>
            <p class="text-gray-500 font-medium">No record data available</p>
        </div>
    </Modal>
</template>
