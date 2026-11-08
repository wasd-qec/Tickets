import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { loginApi, registerApi } from '@/api/auth'
import { setUnauthorizedHandler } from '@/api/client'
import type { Role, User } from '@/types'
import router from '@/router'

function decodeJwtPayload(token: string): Record<string, any> | null {
  try {
    const parts = token.split('.')
    if (parts.length < 2 || !parts[1]) return null
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    )
    return JSON.parse(json)
  } catch {
    return null
  }
}

function loadStoredUser(): User | null {
  try {
    const raw = localStorage.getItem('helpdesk_user')
    return raw ? (JSON.parse(raw) as User) : null
  } catch {
    return null
  }
}

export function getRoleHomePath(role?: Role | null): string {
  if (role === 'TECHNICIAN' || role === 'ADMIN') return '/queue'
  return '/tickets'
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('helpdesk_token'))
  const user = ref<User | null>(loadStoredUser())

  if (token.value && !user.value) {
    const payload = decodeJwtPayload(token.value)
    if (payload) {
      user.value = {
        id: payload.sub ?? payload.id ?? payload.userId ?? 0,
        username: payload.username ?? payload.name ?? 'User',
        role: (payload.role as Role) || 'CLIENT',
      }
    }
  }

  const isAuthenticated = computed(() => Boolean(token.value && user.value))
  const roleHome = computed(() => getRoleHomePath(user.value?.role))

  function setSession(newToken: string, newUser: User) {
    token.value = newToken
    user.value = newUser
    localStorage.setItem('helpdesk_token', newToken)
    localStorage.setItem('helpdesk_user', JSON.stringify(newUser))
  }

  function clearSession() {
    token.value = null
    user.value = null
    localStorage.removeItem('helpdesk_token')
    localStorage.removeItem('helpdesk_user')
  }

  async function login(username: string, password: string) {
    const res: any = await loginApi({ username, password })
    const jwt = res?.token || res?.accessToken || res?.access_token
    if (!jwt) {
      throw new Error('Authentication token missing from response')
    }

    const decoded = decodeJwtPayload(jwt)
    const resolvedUser: User = res?.user || {
      id: res?.id ?? decoded?.sub ?? decoded?.id ?? decoded?.userId ?? 0,
      username: res?.username ?? decoded?.username ?? username,
      role: (res?.role ?? decoded?.role ?? 'CLIENT') as Role,
    }

    setSession(jwt, resolvedUser)
    return resolvedUser
  }

  async function register(username: string, password: string) {
    return await registerApi({ username, password })
  }

  function logout() {
    clearSession()
    router.push('/login')
  }

  setUnauthorizedHandler(() => {
    clearSession()
    if (router.currentRoute.value.path !== '/login') {
      router.push('/login')
    }
  })

  return {
    token,
    user,
    isAuthenticated,
    roleHome,
    login,
    register,
    logout,
    clearSession,
  }
})

