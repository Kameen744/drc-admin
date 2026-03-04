<script setup>
import { useRouter } from "vue-router";
import { ref } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useToast } from "@/composables/useToast";
import LoginForm from "@/components/Auth/LoginForm.vue";

const router = useRouter();
const authStore = useAuthStore();
const { showSuccess, showError } = useToast();
const loading = ref(false);

async function handleLogin(credentials) {
    loading.value = true;
    try {
        const result = await authStore.login(
            credentials.email,
            credentials.password,
        );
        if (result.success) {
            showSuccess("Login successful! Welcome back.");
            router.push("/submissions");
        } else {
            showError(result.error || "Invalid email or password");
        }
    } catch (error) {
        showError("Invalid email or password");
    } finally {
        loading.value = false;
    }
}
</script>

<template>
    <div
        class="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 flex items-center justify-center px-4 py-8"
    >
        <!-- Background decoration -->
        <div class="absolute inset-0 overflow-hidden pointer-events-none">
            <div
                class="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl"
            ></div>
            <div
                class="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/10 rounded-full blur-3xl"
            ></div>
        </div>

        <div class="w-full max-w-md relative">
            <!-- Login Card -->
            <div
                class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 overflow-hidden"
            >
                <!-- Header -->
                <div
                    class="bg-gradient-to-r from-secondary to-blue-900 px-8 py-8 text-center relative overflow-hidden"
                >
                    <div class="absolute inset-0 bg-white/5"></div>
                    <div class="relative">
                        <div
                            class="w-3xs rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm"
                        >
                            <!-- <span class="text-3xl">📊</span> -->
                            <img
                                src="./../ResourceTrackerlogo.png"
                                alt="logo"
                            />
                        </div>
                        <hr />
                        <!-- <h1 class="text-3xl font-bold text-white mb-2">
                            PRMT Admin
                        </h1> -->
                        <p class="text-white/80 text-sm">
                            Partner Resource Management Tracker
                        </p>
                    </div>
                </div>

                <!-- Form -->
                <div class="px-8 py-8">
                    <div class="mb-6 text-center">
                        <h2 class="text-xl font-semibold text-gray-900 mb-1">
                            Welcome back
                        </h2>
                        <p class="text-gray-500 text-sm">
                            Sign in to access your dashboard
                        </p>
                    </div>

                    <LoginForm @submit="handleLogin" />

                    <!-- Loading indicator -->
                    <Transition
                        enter-active-class="transition-opacity duration-200"
                        enter-from-class="opacity-0"
                        enter-to-class="opacity-100"
                        leave-active-class="transition-opacity duration-200"
                        leave-from-class="opacity-100"
                        leave-to-class="opacity-0"
                    >
                        <div v-if="loading" class="mt-6 text-center">
                            <div
                                class="inline-flex items-center gap-2 text-gray-600 bg-gray-50 px-4 py-2 rounded-lg"
                            >
                                <svg
                                    class="animate-spin h-4 w-4 text-primary"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        class="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        stroke-width="4"
                                    ></circle>
                                    <path
                                        class="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                </svg>
                                <span class="text-sm font-medium"
                                    >Signing in...</span
                                >
                            </div>
                        </div>
                    </Transition>
                </div>

                <!-- Footer -->
                <div
                    class="px-8 py-4 bg-gray-50 border-t border-gray-100 text-center"
                >
                    <!-- <p class="text-xs text-gray-500">
                        Protected by enterprise-grade security
                    </p> -->
                </div>
            </div>

            <!-- Help text -->
            <p class="mt-6 text-center text-sm text-gray-500">
                Need help? Contact your system administrator
            </p>
        </div>
    </div>
</template>
