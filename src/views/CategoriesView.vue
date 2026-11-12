<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useToast } from '@/composables/useToast'
import { api } from '@/services/api'
import type { Category } from '@/Data/Categories'
import type { Tickets } from '@/Data/Ticket'
import ConfirmModal from '@/components/ConfirmModal.vue'

const { showToast } = useToast()

const categories = ref<Category[]>([])
const tickets = ref<Tickets[]>([])
const isLoading = ref(true)
const errorMessage = ref('')

const isModalOpen = ref(false)
const modalMode = ref<'create' | 'edit'>('create')
const editingCategoryId = ref<number | null>(null)
const formName = ref('')
const formError = ref('')
const isSaving = ref(false)

const showDeleteConfirm = ref(false)
const deletingCategory = ref<Category | null>(null)

async function fetchData() {
  isLoading.value = true
  errorMessage.value = ''
  try {
    const [cData, tData] = await Promise.all([
      api.getCategories(),
      api.getTickets(),
    ])
    categories.value = cData
    tickets.value = tData
  } catch {
    errorMessage.value = 'Failed to load categories. Please ensure mock API server is running.'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchData()
})

function getUsageCount(catId: number) {
  return tickets.value.filter((t) => t.CategoryID === catId).length
}

function openCreateModal() {
  modalMode.value = 'create'
  editingCategoryId.value = null
  formName.value = ''
  formError.value = ''
  isModalOpen.value = true
}

function openEditModal(cat: Category) {
  modalMode.value = 'edit'
  editingCategoryId.value = cat.CategroyID
  formName.value = String(cat.name)
  formError.value = ''
  isModalOpen.value = true
}

function closeModal() {
  isModalOpen.value = false
  formName.value = ''
  formError.value = ''
}

async function handleSaveCategory() {
  const trimmed = formName.value.trim()
  if (!trimmed) {
    formError.value = 'Category name cannot be empty.'
    return
  }

  const duplicate = categories.value.some(
    (c) =>
      c.name.toLowerCase() === trimmed.toLowerCase() &&
      c.CategroyID !== editingCategoryId.value,
  )
  if (duplicate) {
    formError.value = 'A category with this name already exists.'
    return
  }

  isSaving.value = true
  try {
    if (modalMode.value === 'create') {
      const nextId =
        categories.value.length > 0
          ? Math.max(...categories.value.map((c) => c.CategroyID)) + 1
          : 1
      const created = await api.createCategory({
        CategroyID: nextId,
        name: trimmed,
        Description: '',
      })
      categories.value.push(created)
      showToast('Category created', 'success')
    } else if (modalMode.value === 'edit' && editingCategoryId.value !== null) {
      const targetCat = categories.value.find((c) => c.CategroyID === editingCategoryId.value)
      if (targetCat) {
        const targetId = targetCat.id || targetCat.CategroyID
        await api.updateCategory(targetId as number, { name: trimmed })
        targetCat.name = trimmed
        showToast('Category updated', 'success')
      }
    }
    closeModal()
  } catch {
    showToast('Failed to save category', 'error')
  } finally {
    isSaving.value = false
  }
}

function confirmDelete(cat: Category) {
  const usage = getUsageCount(cat.CategroyID)
  if (usage > 0) {
    showToast(`Cannot delete category: currently used by ${usage} ticket(s)`, 'error')
    return
  }
  deletingCategory.value = cat
  showDeleteConfirm.value = true
}

async function handleDelete() {
  if (!deletingCategory.value) return
  const cat = deletingCategory.value
  showDeleteConfirm.value = false

  try {
    const targetId = cat.id || cat.CategroyID
    await api.deleteCategory(targetId as number)
    categories.value = categories.value.filter((c) => c.CategroyID !== cat.CategroyID)
    showToast('Category deleted', 'success')
  } catch {
    showToast('Failed to delete category', 'error')
  } finally {
    deletingCategory.value = null
  }
}
</script>

<template>
  <div class="categories-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">Categories Management</h1>
        <p class="page-subtitle">Configure ticket issue categories</p>
      </div>

      <button type="button" class="btn-create" @click="openCreateModal">
        + Add Category
      </button>
    </div>

    <div v-if="isLoading" class="state-card">
      <div class="spinner"></div>
      <p class="state-text">Loading categories...</p>
    </div>

    <div v-else-if="errorMessage" class="state-card error-card">
      <p class="error-text">{{ errorMessage }}</p>
      <button type="button" class="btn-primary" @click="fetchData">Retry</button>
    </div>

    <div v-else-if="categories.length === 0" class="empty-card">
      <p class="empty-title">No categories found</p>
      <p class="empty-subtitle">Add your first category to help users organize their support tickets.</p>
      <button type="button" class="btn-primary" @click="openCreateModal">Add Category</button>
    </div>

    <div v-else class="table-card">
      <table class="data-table">
        <thead>
          <tr>
            <th class="col-id">ID</th>
            <th class="col-name">Name</th>
            <th class="col-usage">Tickets Using</th>
            <th class="col-actions">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="cat in categories" :key="cat.CategroyID">
            <td class="col-id">#{{ cat.CategroyID }}</td>
            <td class="col-name font-semibold">{{ cat.name }}</td>
            <td class="col-usage">
              <span class="usage-badge" :class="{ 'zero-usage': getUsageCount(cat.CategroyID) === 0 }">
                {{ getUsageCount(cat.CategroyID) }} ticket(s)
              </span>
            </td>
            <td class="col-actions">
              <button type="button" class="btn-action edit" @click="openEditModal(cat)">Edit</button>
              <button
                type="button"
                class="btn-action delete"
                :disabled="getUsageCount(cat.CategroyID) > 0"
                :title="getUsageCount(cat.CategroyID) > 0 ? 'Cannot delete category with associated tickets' : 'Delete category'"
                @click="confirmDelete(cat)"
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
        <h3 class="modal-title">{{ modalMode === 'create' ? 'Add New Category' : 'Edit Category' }}</h3>

        <form @submit.prevent="handleSaveCategory">
          <div class="form-group">
            <label for="cat-name">Category Name</label>
            <input
              id="cat-name"
              v-model="formName"
              type="text"
              placeholder="e.g. Email, Hardware, Software"
              required
              autofocus
            />
            <span v-if="formError" class="field-error">{{ formError }}</span>
          </div>

          <div class="modal-actions">
            <button type="button" class="btn-secondary" @click="closeModal">Cancel</button>
            <button type="submit" class="btn-primary" :disabled="isSaving">
              {{ isSaving ? 'Saving...' : 'Save Category' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <ConfirmModal
      :open="showDeleteConfirm"
      title="Delete Category"
      :message="`Are you sure you want to delete the category '${deletingCategory?.name}'?`"
      confirm-text="Yes, Delete"
      confirm-type="danger"
      @confirm="handleDelete"
      @cancel="showDeleteConfirm = false"
    />
  </div>
</template>

<style scoped>
.categories-page {
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

.font-semibold {
  font-weight: 600;
}

.usage-badge {
  background: #f1f5f9;
  color: #334155;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
}

.zero-usage {
  color: #94a3b8;
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

.form-group label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #334155;
}

.form-group input {
  padding: 0.6rem 0.85rem;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 0.9rem;
  outline: none;
}

.form-group input:focus {
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
