import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { User } from '@/Data/User'

export const useAuthStore = defineStore('auth', () => {
    // 1. State: current user reference
    const currentUser = ref<User | null>(null)
    // 2. Computed: login status & landing destination based on role
    const isLoggedIn = computed(() => currentUser.value !== null)
    const homeRoute = computed(() => {
        if (currentUser.value?.role === 'TECHNICIAN' || currentUser.value?.role === 'ADMIN') {
            return '/queue'
        }
        return '/tickets'
    })

    // 3. Actions: mutate state
    function setUser(user: User) { currentUser.value = user }
    function clearUser() { currentUser.value = null }

    return {
        currentUser,
        isLoggedIn,
        homeRoute,
        setUser,
        clearUser,
    }
})