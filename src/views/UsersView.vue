<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import { api } from '@/services/api'
import type { Role, User } from '@/Data/User'
import RoleBadge from '@/components/RoleBadge.vue'
import ConfirmModal from '@/components/ConfirmModal.vue'

const auth = useAuthStore()
const { showToast } = useToast()

const users = ref<User[]>([])
const isLoading = ref(true)
const errorMessage = ref('')

const isModalOpen = ref(false)
const modalMode = ref<'create' | 'edit'>('create')
const editingUserId = ref<number | null>(null)
const formUsername = ref('')
const formRole = ref<Role>('CLIENT')
const formError = ref('')
const isSaving = ref(false)

const showDeleteConfirm = ref(false)
const deletingUser = ref<User | null>(null)

async function fetchUsers() {
  isLoading.value = true
  errorMessage.value = ''
  try {
    users.value = await api.getUsers()
  } catch {
    errorMessage.value = 'Failed to load users. Please ensure mock API server is running.'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchUsers()
})

function openCreateModal() {
  modalMode.value = 'create'
  editingUserId.value = null
  formUsername.value = ''
  formRole.value = 'CLIENT'
  formError.value = ''
  isModalOpen.value = true
}

function openEditModal(user: User) {
  modalMode.value = 'edit'
  editingUserId.value = user.id
  formUsername.value = user.username
  formRole.value = user.role
  formError.value = ''
  isModalOpen.value = true
}

function closeModal() {
  isModalOpen.value = false
  formUsername.value = ''
  formError.value = ''
}

async function handleSaveUser() {
  const trimmed = formUsername.value.trim()
  if (trimmed.length < 3 || !/^[a-zA-Z0-9_]+$/.test(trimmed)) {
    formError.value = 'Username must be alphanumeric and at least 3 characters.'
    return
  }

  const duplicate = users.value.some(
    (u) =>
      u.username.toLowerCase() === trimmed.toLowerCase() &&
      u.id !== editingUserId.value,
  )
  if (duplicate) {
    formError.value = 'A user with this username already exists.'
    return
  }

  isSaving.value = true
  try {
    if (modalMode.value === 'create') {
      const newUser = await api.createUser({
        username: trimmed,
        role: formRole.value,
      })
      users.value.push(newUser)
      showToast('User created', 'success')
    } else if (modalMode.value === 'edit' && editingUserId.value !== null) {
      const targetUser = users.value.find((u) => u.id === editingUserId.value)
      if (targetUser) {
        await api.updateUser(targetUser.id, {
          username: trimmed,
          role: formRole.value,
        })
        targetUser.username = trimmed
        targetUser.role = formRole.value

        if (auth.currentUser?.id === targetUser.id) {
          auth.setUser({ ...auth.currentUser, username: trimmed, role: formRole.value })
        }
        showToast('User updated', 'success')
      }
    }
    closeModal()
  } catch {
    showToast('Failed to save user', 'error')
  } finally {
    isSaving.value = false
  }
}

function confirmDelete(user: User) {
  if (user.id === auth.currentUser?.id) {
    showToast('Cannot delete your own account while logged in.', 'error')
    return
  }
  deletingUser.value = user
  showDeleteConfirm.value = true
}

async function handleDelete() {
  if (!deletingUser.value) return
  const user = deletingUser.value
  showDeleteConfirm.value = false

  try {
    await api.deleteUser(user.id)
    users.value = users.value.filter((u) => u.id !== user.id)
    showToast('User deleted', 'success')
  } catch {
    showToast('Failed to delete user', 'error')
  } finally {
    deletingUser.value = null
  }
}
</script>

<template>
  <div class="users-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">Users Management</h1>
        <p class="page-subtitle">Manage accounts, credentials, and access roles</p>
      </div>

      <button type="button" class="btn-create" @click="openCreateModal">
        + Add User
      </button>
    </div>

    <div v-if="isLoading" class="state-card">
      <div class="spinner"></div>
      <p class="state-text">Loading users...</p>
    </div>

    <div v-else-if="errorMessage" class="state-card error-card">
      <p class="error-text">{{ errorMessage }}</p>
      <button type="button" class="btn-primary" @click="fetchUsers">Retry</button>
    </div>

    <div v-else-if="users.length === 0" class="empty-card">
      <p class="empty-title">No users found</p>
      <p class="empty-subtitle">Add users to grant access to the ticketing system.</p>
      <button type="button" class="btn-primary" @click="openCreateModal">Add User</button>
    </div>

    <div v-else class="table-card">
      <table class="data-table">
        <thead>
          <tr>
            <th class="col-id">ID</th>
            <th class="col-user">Username</th>
            <th class="col-role">Role</th>
            <th class="col-actions">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id">
            <td class="col-id">#{{ user.id }}</td>
            <td class="col-user">
              <span class="font-semibold">{{ user.username }}</span>
              <span v-if="user.id === auth.currentUser?.id" class="self-tag">(You)</span>
            </td>
            <td class="col-role">
              <RoleBadge :role="user.role" />
            </td>
            <td class="col-actions">
              <button type="button" class="btn-action edit" @click="openEditModal(user)">Edit</button>
              <button
                type="button"
                class="btn-action delete"
                :disabled="user.id === auth.currentUser?.id"
                :title="user.id === auth.currentUser?.id ? 'Cannot delete your own account' : 'Delete user'"
                @click="confirmDelete(user)"
              >
                Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="isModalOpen" class="modal-backdrop">
      <div class="modal-card">
        <h3 class="modal-title">{{ modalMode === 'create' ? 'Add New User' : 'Edit User' }}</h3>

        <form @submit.prevent="handleSaveUser">
          <div class="form-group">
            <label for="u-name">Username</label>
            <input
              id="u-name"
              v-model="formUsername"
              type="text"
              placeholder="e.g. john_doe"
              required
              autofocus
            />
            <span v-if="formError" class="field-error">{{ formError }}</span>
          </div>

          <div class="form-group mt-3">
            <label for="u-role">Role</label>
            <select id="u-role" v-model="formRole" class="form-select">
              <option value="CLIENT">CLIENT</option>
              <option value="TECHNICIAN">TECHNICIAN</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </div>

          <div class="modal-actions">
            <button type="button" class="btn-secondary" @click="closeModal">Cancel</button>
            <button type="submit" class="btn-primary" :disabled="isSaving">
              {{ isSaving ? 'Saving...' : 'Save User' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <ConfirmModal
      :open="showDeleteConfirm"
      title="Delete User"
      :message="`Are you sure you want to delete user '${deletingUser?.username}'?`"
      confirm-text="Yes, Delete"
      confirm-type="danger"
      @confirm="handleDelete"
      @cancel="showDeleteConfirm = false"
    />
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
  margin: 0;
}

.page-subtitle {
  color: #64748b;
  font-size: 0.875rem;
  margin: 0.25rem 0 0 0;
}

.btn-create {
  background: #2563eb;
  color: #ffffff;
  border: none;
  border-radius: 6px;
  padding: 0.55rem 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s ease;
}

.btn-create:hover {
  background: #1d4ed8;
}

.state-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 3rem 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e2e8f0;
  border-top-color: #2563eb;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.state-text {
  color: #64748b;
  font-size: 0.95rem;
}

.error-card {
  border-color: #fecaca;
  background: #fef2f2;
}

.error-text {
  color: #b91c1c;
  font-size: 0.95rem;
}

.empty-card {
  background: #ffffff;
  border: 1px dashed #cbd5e1;
  border-radius: 10px;
  padding: 3rem 1.5rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.empty-title {
  font-weight: 600;
  color: #334155;
  font-size: 1rem;
}

.empty-subtitle {
  color: #64748b;
  font-size: 0.875rem;
  margin-bottom: 0.75rem;
}

.table-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  overflow: hidden;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
  text-align: left;
}

.data-table th {
  background: #f8fafc;
  color: #475569;
  font-weight: 600;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #e2e8f0;
}

.data-table td {
  padding: 0.85rem 1rem;
  border-bottom: 1px solid #f1f5f9;
  color: #1e293b;
  vertical-align: middle;
}

.col-id {
  width: 80px;
  color: #64748b;
  font-weight: 600;
}

.col-user {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.font-semibold {
  font-weight: 600;
}

.self-tag {
  color: #2563eb;
  font-size: 0.75rem;
  font-weight: 600;
}

.col-role {
  width: 150px;
}

.col-actions {
  width: 160px;
  text-align: right;
}

.btn-action {
  background: none;
  border: none;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  padding: 0.3rem 0.5rem;
}

.btn-action.edit {
  color: #2563eb;
}

.btn-action.edit:hover {
  text-decoration: underline;
}

.btn-action.delete {
  color: #dc2626;
}

.btn-action.delete:hover:not(:disabled) {
  text-decoration: underline;
}

.btn-action.delete:disabled {
  color: #cbd5e1;
  cursor: not-allowed;
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  padding: 1rem;
}

.modal-card {
  background: #ffffff;
  border-radius: 12px;
  width: 100%;
  max-width: 440px;
  padding: 1.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.modal-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 1.25rem 0;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.mt-3 {
  margin-top: 0.85rem;
}

.form-group label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #334155;
}

.form-group input,
.form-select {
  padding: 0.6rem 0.85rem;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 0.9rem;
  outline: none;
  background: #ffffff;
}

.form-group input:focus,
.form-select:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.15);
}

.field-error {
  color: #dc2626;
  font-size: 0.75rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.5rem;
}

.btn-secondary {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  color: #475569;
  padding: 0.55rem 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
}

.btn-secondary:hover {
  background: #f8fafc;
}

.btn-primary {
  background: #2563eb;
  color: #ffffff;
  border: none;
  padding: 0.55rem 1.1rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
}

.btn-primary:hover:not(:disabled) {
  background: #1d4ed8;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
