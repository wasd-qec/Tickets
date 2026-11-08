import { ref } from 'vue'
import { defineStore } from 'pinia'
import { getUsersApi, updateUserRoleApi } from '@/api/users'
import type { Role, User } from '@/types'

export const useUsersStore = defineStore('users', () => {
  const users = ref<User[]>([])
  const loading = ref(false)

  async function fetchUsers() {
    loading.value = true
    try {
      users.value = await getUsersApi()
      return users.value
    } finally {
      loading.value = false
    }
  }

  async function updateRole(id: string | number, role: Role) {
    const idx = users.value.findIndex((u) => String(u.id) === String(id))
    const previousRole = idx !== -1 && users.value[idx] ? users.value[idx]!.role : null

    if (idx !== -1 && users.value[idx]) {
      users.value[idx] = { ...users.value[idx]!, role }
    }

    try {
      const updated = await updateUserRoleApi(id, role)
      if (idx !== -1 && users.value[idx]) {
        users.value[idx] = { ...users.value[idx]!, ...updated, role }
      }
      return updated
    } catch (err) {
      if (idx !== -1 && users.value[idx] && previousRole) {
        users.value[idx] = { ...users.value[idx]!, role: previousRole }
      }
      throw err
    }
  }

  return {
    users,
    loading,
    fetchUsers,
    updateRole,
  }
})

