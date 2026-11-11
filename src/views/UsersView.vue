<script setup lang="ts">
import { ref, computed } from 'vue'
import { mockUsers } from '@/Data/MockData'
import type { User, Role } from '@/Data/User'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import RoleBadge from '@/components/RoleBadge.vue'

const auth = useAuthStore()
const { showToast } = useToast()

const search = ref('')
const selectedRole = ref<'All' | Role>('All')
const roles: ('All' | Role)[] = ['All', 'CLIENT', 'TECHNICIAN', 'ADMIN']

const showEditModal = ref(false)
const userToEdit = ref<User | null>(null)
const editUsername = ref('')
const editRole = ref<Role>('CLIENT')
const formError = ref('')

const filteredUsers = computed(() => {
  return mockUsers.filter((u) => {
    if (selectedRole.value !== 'All' && u.role !== selectedRole.value) {
      return false
    }
    if (search.value.trim()) {
      const q = search.value.trim().toLowerCase()
      if (!u.username.toLowerCase().includes(q)) return false
    }
    return true
  })
})

function getInitials(name: string) {
  return name.slice(0, 2).toUpperCase()
}

function formatDate(iso?: string) {
  if (!iso) return 'Joined recently'
  return `Joined ${new Date(iso).toLocaleDateString()}`
}

function isCurrentUser(u: User) {
  return auth.currentUser?.id === u.id
}

function handleRoleChange(user: User, event: Event) {
  const target = event.target as HTMLSelectElement
  const newRole = target.value as Role
  user.role = newRole
  showToast(`Role updated to ${newRole}`, 'success')
}

function openEditModal(u: User) {
  userToEdit.value = u
  editUsername.value = u.username
  editRole.value = u.role
  formError.value = ''
  showEditModal.value = true
}

function handleSaveEdit() {
  if (!userToEdit.value) return
  formError.value = ''

  const trimmed = editUsername.value.trim()
  if (trimmed.length < 3) {
    formError.value = 'Username must be at least 3 characters.'
    return
  }

  const duplicate = mockUsers.some(
    (u) => u.id !== userToEdit.value?.id && u.username.toLowerCase() === trimmed.toLowerCase(),
  )
  if (duplicate) {
    formError.value = 'Username is already taken.'
    return
  }

  userToEdit.value.username = trimmed
  if (!isCurrentUser(userToEdit.value)) {
    userToEdit.value.role = editRole.value
  }

  showToast('User updated successfully', 'success')
  showEditModal.value = false
}
</script>

<template>
  <div class="users-page">
    <div class="page-header">
      <h1 class="page-title">Users</h1>
      <div class="search-box">
        <input
          v-model="search"
          type="search"
          placeholder="Search by username..."
          class="form-input"
        />
      </div>
    </div>

    <div class="tabs">
      <button
        v-for="r in roles"
        :key="r"
        type="button"
        class="tab-btn"
        :class="{ active: selectedRole === r }"
        @click="selectedRole = r"
      >
        {{ r }}
      </button>
    </div>

    <div v-if="filteredUsers.length === 0" class="empty-card">
      <p class="empty-title">No users found</p>
      <p class="empty-subtitle">Try adjusting your search query or role filter.</p>
    </div>

    <div v-else class="cards-grid">
      <div v-for="u in filteredUsers" :key="u.id" class="user-card">
        <div class="user-top">
          <div class="user-info">
            <div class="avatar">{{ getInitials(u.username) }}</div>
            <div>
              <div class="name-row">
                <span class="username">{{ u.username }}</span>
                <span v-if="isCurrentUser(u)" class="you-badge">You</span>
              </div>
              <span class="joined-date">{{ formatDate(u.createdAt) }}</span>
            </div>
          </div>
          <div class="top-actions">
            <RoleBadge :role="u.role" />
            <button type="button" class="icon-btn" title="Edit user" @click="openEditModal(u)">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
          </div>
        </div>

        <div class="role-selector">
          <label :for="`role-${u.id}`">Role</label>
          <select
            :id="`role-${u.id}`"
            :value="u.role"
            :disabled="isCurrentUser(u)"
            class="form-select"
            @change="handleRoleChange(u, $event)"
          >
            <option value="CLIENT">Client</option>
            <option value="TECHNICIAN">Technician</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>
      </div>
    </div>

    <div v-if="showEditModal" class="modal-backdrop" @click.self="showEditModal = false">
      <div class="modal-box">
        <h2 class="modal-title">Edit User</h2>
        <div v-if="formError" class="error-banner">{{ formError }}</div>

        <form class="modal-form" @submit.prevent="handleSaveEdit">
          <div class="form-group">
            <label for="edit-name">Username</label>
            <input id="edit-name" v-model="editUsername" type="text" required />
          </div>

          <div class="form-group">
            <label for="edit-role">Role</label>
            <select
              id="edit-role"
              v-model="editRole"
              :disabled="userToEdit ? isCurrentUser(userToEdit) : false"
              class="form-select"
            >
              <option value="CLIENT">Client</option>
              <option value="TECHNICIAN">Technician</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          <div class="modal-actions">
            <button type="button" class="btn btn-secondary" @click="showEditModal = false">Cancel</button>
            <button type="submit" class="btn btn-primary">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.users-page {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #0f172a;
}

.search-box {
  width: 260px;
}

.form-input {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.875rem;
  font-family: inherit;
  outline: none;
}

.tabs {
  display: flex;
  gap: 0.5rem;
  border-bottom: 1px solid #e2e8f0;
  overflow-x: auto;
}

.tab-btn {
  background: transparent;
  border: none;
  padding: 0.5rem 0.85rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #64748b;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  white-space: nowrap;
}

.tab-btn.active {
  color: #2563eb;
  font-weight: 600;
  border-bottom-color: #2563eb;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.25rem;
}

.user-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 1.25rem;
}

.user-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 9999px;
  background-color: #dbeafe;
  color: #1d4ed8;
  font-weight: 700;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.name-row {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.username {
  font-weight: 600;
  color: #0f172a;
}

.you-badge {
  background-color: #eff6ff;
  color: #2563eb;
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.1rem 0.4rem;
  border-radius: 9999px;
}

.joined-date {
  font-size: 0.75rem;
  color: #64748b;
}

.top-actions {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.icon-btn {
  background: transparent;
  border: none;
  padding: 0.35rem;
  border-radius: 6px;
  color: #64748b;
  cursor: pointer;
}

.icon-btn:hover {
  background-color: #f1f5f9;
  color: #0f172a;
}

.role-selector {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  padding-top: 0.75rem;
  border-top: 1px solid #e2e8f0;
}

.role-selector label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
}

.form-select {
  padding: 0.45rem 0.65rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.875rem;
  font-family: inherit;
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  background-color: rgba(15, 23, 42, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  z-index: 1000;
}

.modal-box {
  background: #ffffff;
  border-radius: 12px;
  max-width: 440px;
  width: 100%;
  padding: 1.5rem;
}

.modal-title {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.error-banner {
  background-color: #fee2e2;
  color: #b91c1c;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.form-group label {
  font-size: 0.875rem;
  font-weight: 600;
}

.form-group input {
  padding: 0.5rem 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.875rem;
  font-family: inherit;
  outline: none;
}

.form-group input:focus {
  border-color: #2563eb;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.btn {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid transparent;
}

.btn-primary {
  background-color: #2563eb;
  color: #ffffff;
}

.btn-secondary {
  background-color: #ffffff;
  border-color: #e2e8f0;
  color: #0f172a;
}

.empty-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 3rem;
  text-align: center;
}

@media (max-width: 900px) {
  .cards-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .cards-grid {
    grid-template-columns: 1fr;
  }
}
</style>
