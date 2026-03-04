<script setup>
import { useAuthStore } from "@/stores/auth";
import { useRouter } from "vue-router";
import { useToast } from "@/composables/useToast";
import Button from "@/components/UI/Button.vue";
import { ref, computed } from "vue";

const authStore = useAuthStore();
const router = useRouter();
const { showSuccess } = useToast();
const mobileMenuOpen = ref(false);

async function handleLogout() {
    await authStore.logout();
    showSuccess("Logged out successfully");
    router.push("/login");
}

const navigation = [
    {
        name: "Submissions",
        href: "/submissions",
        icon: "📋",
        description: "View and manage partner submissions",
    },
];

const currentPageTitle = computed(() => {
    return router.currentRoute.value.meta.title || "Dashboard";
});
</script>

<template>
    <div class="h-screen bg-gray-50 flex flex-col overflow-hidden">
        <div class="flex flex-1 overflow-hidden">
            <!-- Sidebar -->
            <aside
                :class="[
                    'fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-secondary to-blue-900 text-white transition-transform duration-300 ease-in-out flex flex-col',
                    mobileMenuOpen ? 'translate-x-0' : '-translate-x-full',
                    'lg:translate-x-0 lg:static lg:inset-auto',
                ]"
            >
                <!-- Logo area -->
                <div
                    class="flex items-center justify-center h-16 border-b border-white/10"
                >
                    <div class="flex items-center gap-2">
                        <span class="text-2xl">📊</span>
                        <h1 class="text-xl font-bold">PRMT Admin</h1>
                    </div>
                </div>

                <!-- Navigation -->
                <nav class="flex-1 mt-4 px-3 space-y-1 overflow-y-auto">
                    <router-link
                        v-for="item in navigation"
                        :key="item.name"
                        :to="item.href"
                        @click="mobileMenuOpen = false"
                        class="flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 group"
                        active-class="bg-white/10 shadow-inner"
                        :class="[
                            $route.path === item.href
                                ? 'bg-white/10 shadow-inner'
                                : 'hover:bg-white/5',
                        ]"
                    >
                        <span
                            class="mr-3 text-lg transition-transform group-hover:scale-110"
                            >{{ item.icon }}</span
                        >
                        <div class="flex-1">
                            <p class="font-medium">{{ item.name }}</p>
                            <p
                                v-if="item.description"
                                class="text-xs text-white/60 mt-0.5"
                            >
                                {{ item.description }}
                            </p>
                        </div>
                        <div
                            v-if="$route.path === item.href"
                            class="w-1 h-8 bg-primary rounded-full"
                        ></div>
                    </router-link>
                </nav>

                <!-- User info & logout -->
                <div class="p-4 border-t border-white/10 space-y-3">
                    <div class="px-3 py-2 bg-white/5 rounded-lg">
                        <p class="text-xs text-white/60 mb-1">Signed in as</p>
                        <p class="text-sm font-medium truncate">
                            {{ authStore.user?.email || "User" }}
                        </p>
                    </div>
                    <Button
                        @click="handleLogout"
                        variant="outline-primary"
                        size="sm"
                        class="w-full"
                    >
                        <span>🚪</span>
                        Logout
                    </Button>
                </div>
            </aside>

            <!-- Main content area -->
            <div class="flex-1 lg:ml-0 flex flex-col overflow-hidden">
                <!-- Header -->
                <header class="bg-white border-b border-gray-200 shadow-sm">
                    <div
                        class="flex items-center justify-between px-4 py-3 lg:px-6"
                    >
                        <div class="flex items-center gap-4">
                            <!-- Mobile menu button -->
                            <button
                                @click="mobileMenuOpen = !mobileMenuOpen"
                                class="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                            >
                                <svg
                                    class="h-6 w-6"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                </svg>
                            </button>

                            <!-- Page title & breadcrumb -->
                            <div>
                                <h2 class="text-xl font-semibold text-gray-900">
                                    {{ currentPageTitle }}
                                </h2>
                                <p
                                    v-if="$route.meta.description"
                                    class="text-sm text-gray-500"
                                >
                                    {{ $route.meta.description }}
                                </p>
                            </div>
                        </div>

                        <!-- Header actions -->
                        <div class="flex items-center gap-3">
                            <div class="hidden sm:block text-right">
                                <p class="text-sm text-gray-500">
                                    {{
                                        new Date().toLocaleDateString("en-US", {
                                            weekday: "long",
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                        })
                                    }}
                                </p>
                            </div>
                        </div>
                    </div>
                </header>

                <!-- Main content -->
                <main class="flex-1 overflow-y-auto p-4 lg:p-6">
                    <router-view />
                </main>
            </div>
        </div>

        <!-- Mobile menu overlay -->
        <Transition
            enter-active-class="transition-opacity duration-300"
            enter-from-class="opacity-0"
            enter-to-class="opacity-100"
            leave-active-class="transition-opacity duration-300"
            leave-from-class="opacity-100"
            leave-to-class="opacity-0"
        >
            <div
                v-if="mobileMenuOpen"
                class="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
                @click="mobileMenuOpen = false"
            ></div>
        </Transition>
    </div>
</template>
