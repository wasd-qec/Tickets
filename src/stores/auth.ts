import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { User } from '@/Data/User'
import { api } from '@/services/api'

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

    async function login(username: string): Promise<User | null> {
        try {
            const users = await api.getUsers()
            const found = users.find((u) => u.username.toLowerCase() === username.trim().toLowerCase())
            if (found) {
                setUser(found)
                return found
            }
        } catch {
            return null
        }
        return null
    }

    return {
        currentUser,
        isLoggedIn,
        homeRoute,
        setUser,
        clearUser,
        login,
    }
})