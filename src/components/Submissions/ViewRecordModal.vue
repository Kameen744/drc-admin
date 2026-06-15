<script setup>
import { ref, watch, reactive } from "vue";
import { usePocketBase } from "@/composables/usePocketBase";
import { useToast } from "@/composables/useToast";
import { formatDate, formatArray, extractFromArray, extractProgramAreaNames } from "@/utils/helpers";
import ProgramAreaTree from "@/components/Submissions/ProgramAreaTree.vue";
import { useAuthStore } from "@/stores/auth";
import { storeToRefs } from "pinia";
import Modal from "@/components/UI/Modal.vue";
import Button from "@/components/UI/Button.vue";
import Badge from "@/components/UI/Badge.vue";
import Card from "@/components/UI/Card.vue";
import { t } from "@/i18n";

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

const authStore = useAuthStore();
const { isSuperAdmin } = storeToRefs(authStore);

const { fetchOneRecord, updateRecord, loading } = usePocketBase();
const { showSuccess, showError } = useToast();

const record = ref(null);
const isEditing = ref(false);
const editForm = reactive({});

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
            isEditing.value = false;
            await fetchRecord();
        }
    },
);

function startEditing() {
    if (!record.value) return;
    editForm.Partner_Name = record.value.Partner_Name || "";
    editForm.Partner_Type = Array.isArray(record.value.Partner_Type)
        ? record.value.Partner_Type.join(", ")
        : record.value.Partner_Type || "";
    editForm.Name_of_Funder = record.value.Name_of_Funder || "";
    editForm.Program_Area = (record.value.Program_Area && typeof record.value.Program_Area === 'object' && !Array.isArray(record.value.Program_Area))
        ? JSON.parse(JSON.stringify(record.value.Program_Area))
        : record.value.Program_Area || {};
    editForm.Nature_of_Support = Array.isArray(record.value.Nature_of_Support)
        ? record.value.Nature_of_Support.join(", ")
        : record.value.Nature_of_Support || "";
    editForm.Summary_of_support = record.value.Summary_of_support || "";
    editForm.Start_date_of_support = record.value.Start_date_of_support
        ? record.value.Start_date_of_support.split(" ")[0]
        : "";
    editForm.End_date_of_support = record.value.End_date_of_support
        ? record.value.End_date_of_support.split(" ")[0]
        : "";
    editForm.Organization_focal_person = record.value.Organization_focal_person || "";
    editForm.Email = record.value.Email || "";
    editForm.Phone_number = record.value.Phone_number || "";
    isEditing.value = true;
}

function cancelEditing() {
    isEditing.value = false;
}

async function saveChanges() {
    try {
        const data = {
            Partner_Name: editForm.Partner_Name,
            Partner_Type: editForm.Partner_Type
                .split(",")
                .map(s => s.trim())
                .filter(Boolean),
            Name_of_Funder: editForm.Name_of_Funder,
            Program_Area: editForm.Program_Area,
            Nature_of_Support: editForm.Nature_of_Support
                .split(",")
                .map(s => s.trim())
                .filter(Boolean),
            Summary_of_support: editForm.Summary_of_support,
            Start_date_of_support: editForm.Start_date_of_support,
            End_date_of_support: editForm.End_date_of_support,
            Organization_focal_person: editForm.Organization_focal_person,
            Email: editForm.Email,
            Phone_number: editForm.Phone_number,
        };
        const updated = await updateRecord("prmt_data", record.value.id, data);
        record.value = updated;
        isEditing.value = false;
        showSuccess(t("success.recordUpdated"));
        emit("updated");
    } catch (error) {
        showError(t("success.updateFailed"));
    }
}

async function handleToggleApprove() {
    if (!record.value) return;

    try {
        const updated = await updateRecord("prmt_data", record.value.id, {
            approve: !record.value.approve,
        });
        record.value = updated;
        showSuccess(t("success.recordStatusUpdated"));
        emit("updated");
    } catch (error) {
        showError(t("success.statusUpdateFailed"));
    }
}

function handleClose() {
    emit("close");
    record.value = null;
    isEditing.value = false;
}
</script>

<template>
    <Modal :open="open" :title="t('modal.recordDetails')" size="lg" @close="handleClose">
        <template #footer>
            <Button variant="ghost" @click="handleClose"> {{ t("modal.close") }} </Button>
            <Button
                v-if="isSuperAdmin && record && !isEditing"
                variant="outline-primary"
                @click="startEditing"
            >
                {{ t("modal.edit") }}
            </Button>
            <template v-if="isEditing">
                <Button variant="ghost" @click="cancelEditing"> {{ t("modal.cancel") }} </Button>
                <Button variant="primary" :loading="loading" @click="saveChanges">
                    {{ t("modal.saveChanges") }}
                </Button>
            </template>
            <Button
                v-if="record && isSuperAdmin && !isEditing"
                @click="handleToggleApprove"
                :variant="record.approve ? 'danger' : 'primary'"
                :loading="loading"
            >
                {{ record.approve ? t("modal.unapprove") : t("modal.approve") }}
            </Button>
        </template>

        <!-- Loading State -->
        <div v-if="loading && !record" class="text-center py-12">
            <div
                class="inline-block animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent"
            ></div>
            <p class="mt-4 text-gray-600">{{ t("modal.loadingRecord") }}</p>
        </div>

        <!-- Edit Mode -->
        <div v-else-if="record && isEditing" class="space-y-6">
            <!-- Partner Information (Edit) -->
            <section>
                <div class="flex items-center gap-2 mb-4">
                    <div class="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <span class="text-sm">&#127970;</span>
                    </div>
                    <h3 class="text-lg font-semibold text-secondary">{{ t("sections.partnerInformation") }}</h3>
                </div>
                <Card variant="bordered" padding="lg">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="space-y-1">
                            <label class="text-xs font-medium text-gray-500 uppercase tracking-wide">{{ t("fields.partnerName") }}</label>
                            <input v-model="editForm.Partner_Name" type="text"
                                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-sm" />
                        </div>
                        <div class="space-y-1">
                            <label class="text-xs font-medium text-gray-500 uppercase tracking-wide">{{ t("fields.partnerTypeHint") }}</label>
                            <input v-model="editForm.Partner_Type" type="text"
                                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-sm" />
                        </div>
                        <div class="space-y-1">
                            <label class="text-xs font-medium text-gray-500 uppercase tracking-wide">{{ t("fields.emailAddress") }}</label>
                            <input v-model="editForm.Email" type="email"
                                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-sm" />
                        </div>
                        <div class="space-y-1">
                            <label class="text-xs font-medium text-gray-500 uppercase tracking-wide">{{ t("fields.phoneNumber") }}</label>
                            <input v-model="editForm.Phone_number" type="text"
                                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-sm" />
                        </div>
                    </div>
                </Card>
            </section>

            <!-- Support Details (Edit) -->
            <section>
                <div class="flex items-center gap-2 mb-4">
                    <div class="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                        <span class="text-sm">&#128188;</span>
                    </div>
                    <h3 class="text-lg font-semibold text-secondary">{{ t("sections.supportDetails") }}</h3>
                </div>
                <Card variant="bordered" padding="lg">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="space-y-1">
                            <label class="text-xs font-medium text-gray-500 uppercase tracking-wide">{{ t("fields.fundingOrganization") }}</label>
                            <input v-model="editForm.Name_of_Funder" type="text"
                                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-sm" />
                        </div>
                        <div class="md:col-span-2 space-y-1">
                            <label class="text-xs font-medium text-gray-500 uppercase tracking-wide">{{ t("fields.programAreas") }}</label>
                            <ProgramAreaTree
                                v-if="editForm.Program_Area && typeof editForm.Program_Area === 'object' && !Array.isArray(editForm.Program_Area)"
                                v-model="editForm.Program_Area"
                                :readonly="false"
                            />
                            <span v-else class="text-sm text-gray-400 italic">No program area data</span>
                        </div>
                        <div class="space-y-1">
                            <label class="text-xs font-medium text-gray-500 uppercase tracking-wide">{{ t("fields.natureOfSupportHint") }}</label>
                            <input v-model="editForm.Nature_of_Support" type="text"
                                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-sm" />
                        </div>
                        <div class="space-y-1">
                            <label class="text-xs font-medium text-gray-500 uppercase tracking-wide">{{ t("fields.startDate") }}</label>
                            <input v-model="editForm.Start_date_of_support" type="date"
                                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-sm" />
                        </div>
                        <div class="space-y-1">
                            <label class="text-xs font-medium text-gray-500 uppercase tracking-wide">{{ t("fields.endDate") }}</label>
                            <input v-model="editForm.End_date_of_support" type="date"
                                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-sm" />
                        </div>
                        <div class="md:col-span-2 space-y-1">
                            <label class="text-xs font-medium text-gray-500 uppercase tracking-wide">{{ t("fields.summaryOfSupport") }}</label>
                            <textarea v-model="editForm.Summary_of_support" rows="4"
                                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-sm"></textarea>
                        </div>
                    </div>
                </Card>
            </section>

            <!-- Contact Information (Edit) -->
            <section>
                <div class="flex items-center gap-2 mb-4">
                    <div class="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                        <span class="text-sm">&#128100;</span>
                    </div>
                    <h3 class="text-lg font-semibold text-secondary">{{ t("sections.contactInformation") }}</h3>
                </div>
                <Card variant="bordered" padding="lg">
                    <div class="space-y-1">
                        <label class="text-xs font-medium text-gray-500 uppercase tracking-wide">{{ t("fields.orgFocalPerson") }}</label>
                        <input v-model="editForm.Organization_focal_person" type="text"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-sm" />
                    </div>
                </Card>
            </section>
        </div>

        <!-- View Mode -->
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
                                record.approve ? "&#9989;" : "&#9203;"
                            }}</span>
                        </div>
                        <div>
                            <p class="text-sm text-gray-500">{{ t("modal.approvalStatus") }}</p>
                            <Badge
                                :variant="
                                    record.approve ? 'success' : 'warning'
                                "
                                size="lg"
                                :dot="true"
                            >
                                {{
                                    record.approve
                                        ? t("modal.approved")
                                        : t("modal.pendingReview")
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
                        <span class="text-sm">&#127970;</span>
                    </div>
                    <h3 class="text-lg font-semibold text-secondary">
                        {{ t("sections.partnerInformation") }}
                    </h3>
                </div>
                <Card variant="bordered" padding="lg">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="space-y-1">
                            <label class="text-xs font-medium text-gray-500 uppercase tracking-wide">{{ t("fields.partnerNameView") }}</label>
                            <p class="font-semibold text-gray-900">
                                {{ record.Partner_Name || t("app.na") }}
                            </p>
                        </div>
                        <div class="space-y-1">
                            <label class="text-xs font-medium text-gray-500 uppercase tracking-wide">{{ t("fields.partnerType") }}</label>
                            <div class="flex flex-wrap gap-1.5 mt-1">
                                <span
                                    v-for="(type, index) in formatArray(record.Partner_Type)"
                                    :key="index"
                                    class="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md text-sm font-medium border border-blue-100"
                                >
                                    {{ type }}
                                </span>
                                <span
                                    v-if="!record.Partner_Type || record.Partner_Type.length === 0"
                                    class="text-gray-400"
                                >{{ t("app.na") }}</span>
                            </div>
                        </div>
                        <div class="space-y-1">
                            <label class="text-xs font-medium text-gray-500 uppercase tracking-wide">{{ t("fields.emailAddress") }}</label>
                            <p class="font-medium text-gray-900">
                                {{ record.Email || t("app.na") }}
                            </p>
                        </div>
                        <div class="space-y-1">
                            <label class="text-xs font-medium text-gray-500 uppercase tracking-wide">{{ t("fields.phoneNumber") }}</label>
                            <p class="font-medium text-gray-900">
                                {{ record.Phone_number || t("app.na") }}
                            </p>
                        </div>
                    </div>
                </Card>
            </section>

            <!-- Support Details -->
            <section>
                <div class="flex items-center gap-2 mb-4">
                    <div class="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                        <span class="text-sm">&#128188;</span>
                    </div>
                    <h3 class="text-lg font-semibold text-secondary">{{ t("sections.supportDetails") }}</h3>
                </div>
                <Card variant="bordered" padding="lg">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="space-y-1">
                            <label class="text-xs font-medium text-gray-500 uppercase tracking-wide">{{ t("fields.fundingOrganization") }}</label>
                            <p class="font-medium text-gray-900">
                                {{ record.Name_of_Funder || t("app.na") }}
                            </p>
                        </div>
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
                        <div class="space-y-1">
                            <label class="text-xs font-medium text-gray-500 uppercase tracking-wide">{{ t("fields.natureOfSupport") }}</label>
                            <div class="flex flex-wrap gap-1.5 mt-1">
                                <span
                                    v-for="(support, index) in formatArray(record.Nature_of_Support)"
                                    :key="index"
                                    class="px-2.5 py-1 bg-purple-50 text-purple-700 rounded-md text-sm font-medium border border-purple-100"
                                >
                                    {{ support }}
                                </span>
                                <span
                                    v-if="!record.Nature_of_Support || record.Nature_of_Support.length === 0"
                                    class="text-gray-400"
                                >{{ t("app.na") }}</span>
                            </div>
                        </div>
                        <div class="space-y-1">
                            <label class="text-xs font-medium text-gray-500 uppercase tracking-wide">{{ t("fields.startDate") }}</label>
                            <p class="font-medium text-gray-900">
                                {{ formatDate(record.Start_date_of_support) }}
                            </p>
                        </div>
                        <div class="space-y-1">
                            <label class="text-xs font-medium text-gray-500 uppercase tracking-wide">{{ t("fields.endDate") }}</label>
                            <p class="font-medium text-gray-900">
                                {{ formatDate(record.End_date_of_support) }}
                            </p>
                        </div>
                        <div class="md:col-span-2 space-y-1">
                            <label class="text-xs font-medium text-gray-500 uppercase tracking-wide">{{ t("fields.summaryOfSupport") }}</label>
                            <p class="font-medium text-gray-900 leading-relaxed">
                                {{ record.Summary_of_support || t("app.na") }}
                            </p>
                        </div>
                    </div>
                </Card>
            </section>

            <!-- Geographic Coverage -->
            <section>
                <div class="flex items-center gap-2 mb-4">
                    <div class="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                        <span class="text-sm">&#128506;</span>
                    </div>
                    <h3 class="text-lg font-semibold text-secondary">{{ t("sections.geographicCoverage") }}</h3>
                </div>
                <Card variant="bordered" padding="lg">
                    <div class="grid grid-cols-1 gap-4">
                        <div class="space-y-1">
                            <label class="text-xs font-medium text-gray-500 uppercase tracking-wide">{{ t("fields.provinces") }}</label>
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
                                >{{ t("app.na") }}</span>
                            </div>
                        </div>
                        <div class="space-y-1">
                            <label class="text-xs font-medium text-gray-500 uppercase tracking-wide">{{ t("fields.territories") }}</label>
                            <div class="flex flex-wrap gap-1.5 mt-1">
                                <span
                                     v-for="(lga, index) in extractFromArray(record.lga_data, 'territory')"
                                    :key="index"
                                    class="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md text-sm font-medium border border-blue-100"
                                >
                                    {{ lga }}
                                </span>
                                <span
                                    v-if="!record.lga_data || record.lga_data.length === 0"
                                    class="text-gray-400"
                                >{{ t("app.na") }}</span>
                            </div>
                        </div>
                        <div class="space-y-1">
                            <label class="text-xs font-medium text-gray-500 uppercase tracking-wide">{{ t("fields.chiefdoms") }}</label>
                            <div class="flex flex-wrap gap-1.5 mt-1">
                                <span
                                     v-for="(ward, index) in extractFromArray(record.ward_data, 'chiefdom')"
                                    :key="index"
                                    class="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-md text-sm font-medium border border-indigo-100"
                                >
                                    {{ ward }}
                                </span>
                                <span
                                    v-if="!record.ward_data || record.ward_data.length === 0"
                                    class="text-gray-400"
                                >{{ t("app.na") }}</span>
                            </div>
                        </div>
                        <div class="space-y-1">
                            <label class="text-xs font-medium text-gray-500 uppercase tracking-wide">{{ t("fields.facilities") }}</label>
                            <div class="flex flex-wrap gap-1.5 mt-1">
                                <span
                                    v-for="(facility, index) in extractFromArray(record.facility_data, 'facility')"
                                    :key="index"
                                    class="px-2.5 py-1 bg-teal-50 text-teal-700 rounded-md text-sm font-medium border border-teal-100"
                                >
                                    {{ facility }}
                                </span>
                                <span
                                    v-if="!record.facility_data || record.facility_data.length === 0"
                                    class="text-gray-400"
                                >{{ t("app.na") }}</span>
                            </div>
                        </div>
                    </div>
                </Card>
            </section>

            <!-- Contact Information -->
            <section>
                <div class="flex items-center gap-2 mb-4">
                    <div class="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                        <span class="text-sm">&#128100;</span>
                    </div>
                    <h3 class="text-lg font-semibold text-secondary">{{ t("sections.contactInformation") }}</h3>
                </div>
                <Card variant="bordered" padding="lg">
                    <div class="space-y-1">
                        <label class="text-xs font-medium text-gray-500 uppercase tracking-wide">{{ t("fields.orgFocalPerson") }}</label>
                        <p class="font-medium text-gray-900">
                            {{ record.Organization_focal_person || t("app.na") }}
                        </p>
                    </div>
                </Card>
            </section>
        </div>

        <!-- No Data State -->
        <div v-else class="text-center py-12">
            <div class="text-5xl mb-4">&#128237;</div>
            <p class="text-gray-500 font-medium">{{ t("modal.noRecord") }}</p>
        </div>
    </Modal>
</template>
