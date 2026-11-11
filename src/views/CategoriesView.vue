<script setup lang="ts">
import { ref } from 'vue'
import { mockCategories, mockTickets } from '@/Data/MockData'
import type { Category } from '@/Data/Categories'
import { useToast } from '@/composables/useToast'
import ConfirmModal from '@/components/ConfirmModal.vue'

const { showToast } = useToast()

const showModal = ref(false)
const isEditing = ref(false)
const currentId = ref<number | null>(null)
const name = ref('')
const description = ref('')
const formError = ref('')

const categoryToDelete = ref<Category | null>(null)

function getActiveCount(categoryId: number) {
  return mockTickets.filter(
    (t) => t.CategoryID === categoryId && t.Stage !== 'Closed' && t.Stage !== 'Cancelled',
  ).length
}

function openAddModal() {
  isEditing.value = false
  currentId.value = null
  name.value = ''
  description.value = ''
  formError.value = ''
  showModal.value = true
}

function openEditModal(cat: Category) {
  isEditing.value = true
  currentId.value = cat.CategroyID
  name.value = String(cat.name)
  description.value = String(cat.Description || '')
  formError.value = ''
  showModal.value = true
}

function handleSave() {
  formError.value = ''
  if (!name.value.trim()) {
    formError.value = 'Category name is required.'
    return
  }

  if (isEditing.value && currentId.value) {
    const found = mockCategories.find((c) => c.CategroyID === currentId.value)
    if (found) {
      found.name = name.value.trim()
      found.Description = description.value.trim()
      showToast('Category updated successfully', 'success')
    }
  } else {
    const newId = Date.now()
    mockCategories.push({
      CategroyID: newId,
      name: name.value.trim(),
      Description: description.value.trim(),
    })
    showToast('Category added successfully', 'success')
  }

  showModal.value = false
}

function openDeleteModal(cat: Category) {
  if (getActiveCount(cat.CategroyID) > 0) return
  categoryToDelete.value = cat
}

function handleConfirmDelete() {
  if (!categoryToDelete.value) return
  const idx = mockCategories.findIndex((c) => c.CategroyID === categoryToDelete.value?.CategroyID)
  if (idx !== -1) {
    mockCategories.splice(idx, 1)
    showToast('Category deleted', 'success')
  }
  categoryToDelete.value = null
}
</script>

<template>
  <div class="categories-page">
    <div class="page-header">
      <h1 class="page-title">Categories</h1>
      <button type="button" class="btn btn-primary" @click="openAddModal">+ Add Category</button>
    </div>

    <div v-if="mockCategories.length === 0" class="empty-card">
      <p class="empty-title">No categories yet</p>
      <p class="empty-subtitle">Create support categories to organize tickets.</p>
      <button type="button" class="btn btn-primary" @click="openAddModal">+ Add Category</button>
    </div>

    <div v-else class="cards-grid">
      <div v-for="cat in mockCategories" :key="cat.CategroyID" class="category-card">
        <div class="card-head">
          <div class="category-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
            </svg>
          </div>
          <div class="card-actions">
            <button type="button" class="icon-btn" title="Edit" @click="openEditModal(cat)">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
            <span
              :title="
                getActiveCount(cat.CategroyID) > 0
                  ? 'Cannot delete a category with active tickets'
                  : 'Delete category'
              "
            >
              <button
                type="button"
                class="icon-btn"
                :disabled="getActiveCount(cat.CategroyID) > 0"
                @click="openDeleteModal(cat)"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z" />
                </svg>
              </button>
            </span>
          </div>
        </div>

        <h3 class="category-name">{{ cat.name }}</h3>
        <p class="category-desc">{{ cat.Description || 'No description provided.' }}</p>

        <div class="card-foot">
          <span class="count-chip">{{ getActiveCount(cat.CategroyID) }} active tickets</span>
        </div>
      </div>
    </div>

    <div v-if="showModal" class="modal-backdrop" @click.self="showModal = false">
      <div class="modal-box">
        <h2 class="modal-title">{{ isEditing ? 'Edit Category' : 'Add Category' }}</h2>
        <div v-if="formError" class="error-banner">{{ formError }}</div>

        <form class="modal-form" @submit.prevent="handleSave">
          <div class="form-group">
            <label for="cat-name">Name</label>
            <input id="cat-name" v-model="name" type="text" placeholder="e.g. Hardware" required />
          </div>

          <div class="form-group">
            <label for="cat-desc">Description</label>
            <textarea
              id="cat-desc"
              v-model="description"
              rows="3"
              placeholder="Short description of this category..."
            ></textarea>
          </div>

          <div class="modal-actions">
            <button type="button" class="btn btn-secondary" @click="showModal = false">Cancel</button>
            <button type="submit" class="btn btn-primary">Save</button>
          </div>
        </form>
      </div>
    </div>

    <ConfirmModal
      :open="Boolean(categoryToDelete)"
      title="Delete Category"
      :message="`Are you sure you want to delete category &quot;${categoryToDelete?.name}&quot;?`"
      confirm-label="Delete"
      :danger="true"
      @confirm="handleConfirmDelete"
      @cancel="categoryToDelete = null"
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
}

.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #0f172a;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.25rem;
}

.category-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
}

.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.category-icon {
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 8px;
  background-color: #dbeafe;
  color: #1d4ed8;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-actions {
  display: flex;
  gap: 0.25rem;
}

.icon-btn {
  background: transparent;
  border: none;
  padding: 0.35rem;
  border-radius: 6px;
  color: #64748b;
  cursor: pointer;
}

.icon-btn:hover:not(:disabled) {
  background-color: #f1f5f9;
  color: #0f172a;
}

.icon-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.category-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 0.35rem;
}

.category-desc {
  font-size: 0.875rem;
  color: #64748b;
  flex: 1;
  margin-bottom: 1rem;
}

.count-chip {
  background-color: #f1f5f9;
  color: #475569;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.6rem;
  border-radius: 9999px;
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

.form-group input,
.form-group textarea {
  padding: 0.5rem 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.875rem;
  font-family: inherit;
  outline: none;
}

.form-group input:focus,
.form-group textarea:focus {
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
