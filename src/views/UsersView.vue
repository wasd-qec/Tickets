<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useUsersStore } from '@/stores/users'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import RoleBadge from '@/components/RoleBadge.vue'
import type { Role, User } from '@/types'

const usersStore = useUsersStore()
const auth = useAuthStore()
const { showToast } = useToast()

const search = ref('')
const activeTab = ref<'ALL' | Role>('ALL')
const savingUserIds = ref<Record<string, boolean>>({})

const editingUser = ref<User | null>(null)
const editUsername = ref('')
const editRole = ref<Role>('CLIENT')
const editError = ref('')
const editSaving = ref(false)

const tabs: { label: string; value: 'ALL' | Role }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Clients', value: 'CLIENT' },
  { label: 'Technicians', value: 'TECHNICIAN' },
  { label: 'Admins', value: 'ADMIN' },
]

const roleLabels: Record<Role, string> = {
  CLIENT: 'Client',
  TECHNICIAN: 'Technician',
  ADMIN: 'Admin',
}

onMounted(async () => {
  try {
    await usersStore.fetchUsers()
  } catch (err: any) {
    showToast(err?.message || 'Failed to load users', 'error')
  }
})

const filteredUsers = computed(() => {
  return usersStore.users.filter((u) => {
    if (activeTab.value !== 'ALL' && u.role !== activeTab.value) {
      return false
    }
    if (search.value.trim()) {
      const q = search.value.trim().toLowerCase()
      if (!u.username.toLowerCase().includes(q)) return false
    }
    return true
  })
})

function isCurrentUser(u: User): boolean {
  if (!auth.user) return false
  if (u.id !== undefined && auth.user.id !== undefined && String(u.id) === String(auth.user.id)) {
    return true
  }
  return u.username === auth.user.username
}

function getInitials(name: string): string {
  const clean = name.trim()
  if (!clean) return '?'
  const parts = clean.split(/[\s_.-]+/).filter(Boolean)
  if (parts.length >= 2 && parts[0] && parts[1]) {
    return (parts[0][0]! + parts[1][0]!).toUpperCase()
  }
  return clean.slice(0, 2).toUpperCase()
}

function formatJoined(iso?: string): string {
  if (!iso) return 'Joined recently'
  const dateStr = new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
  return `Joined ${dateStr}`
}

async function onRoleChange(user: User, event: Event) {
  const select = event.target as HTMLSelectElement
  const newRole = select.value as Role
  const previousRole = user.role
  if (newRole === previousRole) return

  const key = String(user.id)
  savingUserIds.value[key] = true
  try {
    await usersStore.updateRole(user.id, newRole)
    showToast(`Role updated to ${roleLabels[newRole]}`, 'success')
  } catch (err: any) {
    select.value = previousRole
    showToast(err?.message || 'Failed to update role', 'error')
  } finally {
    savingUserIds.value[key] = false
  }
}

function openEditModal(u: User) {
  editingUser.value = u
  editUsername.value = u.username
  editRole.value = u.role
  editError.value = ''
}

function closeEditModal() {
  if (editSaving.value) return
  editingUser.value = null
}

async function handleSaveEdit() {
  if (!editingUser.value) return
  editError.value = ''
  const trimmed = editUsername.value.trim()
  if (trimmed.length < 3) {
    editError.value = 'Username must be at least 3 characters.'
    return
  }

  editSaving.value = true
  try {
    const updated = await usersStore.updateUser(editingUser.value.id, {
      username: trimmed,
      role: isCurrentUser(editingUser.value) ? editingUser.value.role : editRole.value,
    })
    if (isCurrentUser(editingUser.value) && auth.user) {
      auth.user = { ...auth.user, username: updated.username }
      localStorage.setItem('helpdesk_user', JSON.stringify(auth.user))
    }
    showToast('User updated successfully', 'success')
    editingUser.value = null
  } catch (err: any) {
    const msg = err?.message || 'Failed to update user'
    editError.value = msg
    showToast(msg, 'error')
  } finally {
    editSaving.value = false
  }
}
</script>

<template>
  <div>
    <div class="page-header">
      <h2 class="page-title">Users</h2>
      <div class="search-box">
        <input
          v-model="search"
          type="search"
          class="form-input"
          placeholder="Search by username..."
        />
      </div>
    </div>

    <div class="tabs">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        type="button"
        class="tab-btn"
        :class="{ active: activeTab === tab.value }"
        @click="activeTab = tab.value"
      >
        {{ tab.label }}
      </button>
    </div>

    <div v-if="usersStore.loading" class="cards-grid">
      <div v-for="n in 6" :key="n" class="card">
        <div class="skeleton skeleton-user-top"></div>
        <div class="skeleton skeleton-user-bottom"></div>
      </div>
    </div>

    <div v-else-if="filteredUsers.length === 0" class="card empty-state">
      <h3>No users found</h3>
      <p>No users match your current search or role filter.</p>
    </div>

    <div v-else class="cards-grid">
      <div v-for="u in filteredUsers" :key="u.id" class="card user-card">
        <div class="user-card-top">
          <div class="user-identity">
            <div class="avatar avatar-lg">{{ getInitials(u.username) }}</div>
            <div>
              <div class="username-row">
                <span class="username">{{ u.username }}</span>
                <span v-if="isCurrentUser(u)" class="you-tag">You</span>
              </div>
              <div class="joined-date">{{ formatJoined(u.createdAt) }}</div>
            </div>
          </div>
          <div class="user-top-right">
            <RoleBadge :role="u.role" />
            <button
              type="button"
              class="btn-icon"
              title="Edit user"
              @click="openEditModal(u)"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </button>
          </div>
        </div>

        <div class="user-card-bottom">
          <label :for="`role-select-${u.id}`" class="role-select-label">Role</label>
          <select
            :id="`role-select-${u.id}`"
            class="form-select"
            :value="u.role"
            :disabled="isCurrentUser(u) || Boolean(savingUserIds[String(u.id)])"
            @change="onRoleChange(u, $event)"
          >
            <option value="CLIENT">Client</option>
            <option value="TECHNICIAN">Technician</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>
      </div>
    </div>

    <div v-if="editingUser" class="modal-backdrop" @click.self="closeEditModal">
      <div class="card modal-card" role="dialog" aria-modal="true">
        <h3 class="modal-title">Edit User</h3>

        <div v-if="editError" class="alert-error">{{ editError }}</div>

        <form @submit.prevent="handleSaveEdit" novalidate>
          <div class="form-group">
            <label for="edit-user-name" class="form-label">Username</label>
            <input
              id="edit-user-name"
              v-model="editUsername"
              type="text"
              class="form-input"
              required
            />
          </div>

          <div class="form-group">
            <label for="edit-user-role" class="form-label">Role</label>
            <select
              id="edit-user-role"
              v-model="editRole"
              class="form-select"
              :disabled="isCurrentUser(editingUser)"
            >
              <option value="CLIENT">Client</option>
              <option value="TECHNICIAN">Technician</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          <div class="modal-actions">
            <button
              type="button"
              class="btn btn-secondary"
              :disabled="editSaving"
              @click="closeEditModal"
            >
              Cancel
            </button>
            <button type="submit" class="btn btn-primary" :disabled="editSaving">
              {{ editSaving ? 'Saving...' : 'Save' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.search-box {
  width: 280px;
  max-width: 100%;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.25rem;
}

.user-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 1.1rem;
}

.user-card-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
}

.user-top-right {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.user-identity {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 0;
}

.avatar-lg {
  width: 2.5rem;
  height: 2.5rem;
  font-size: 0.85rem;
}

.username-row {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex-wrap: wrap;
}

.username {
  font-weight: 600;
  font-size: 0.95rem;
  color: var(--text);
}

.you-tag {
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.1rem 0.45rem;
  border-radius: 9999px;
  background: var(--primary-light);
  color: var(--primary);
}

.joined-date {
  font-size: 0.78rem;
  color: var(--text-muted);
  margin-top: 0.1rem;
}

.user-card-bottom {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  padding-top: 0.85rem;
  border-top: 1px solid var(--border);
}

.role-select-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  z-index: 1000;
}

.modal-card {
  max-width: 440px;
  width: 100%;
  padding: 1.5rem;
}

.modal-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.alert-error {
  padding: 0.75rem;
  border-radius: var(--radius-sm);
  background: var(--danger-light);
  color: var(--danger);
  font-size: 0.85rem;
  font-weight: 500;
  margin-bottom: 1rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.625rem;
  margin-top: 0.5rem;
}

.skeleton-user-top {
  height: 44px;
  width: 100%;
  margin-bottom: 1rem;
}

.skeleton-user-bottom {
  height: 36px;
  width: 100%;
}

@media (max-width: 960px) {
  .cards-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .cards-grid {
    grid-template-columns: 1fr;
  }

  .search-box {
    width: 100%;
  }
}
</style>
