<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useCategoriesStore } from '@/stores/categories'
import { useToast } from '@/composables/useToast'
import ConfirmModal from '@/components/ConfirmModal.vue'
import type { Category } from '@/types'

const categoriesStore = useCategoriesStore()
const { showToast } = useToast()

const modalOpen = ref(false)
const editingCategory = ref<Category | null>(null)
const nameInput = ref('')
const descriptionInput = ref('')
const formError = ref('')
const saving = ref(false)

const deleteTarget = ref<Category | null>(null)
const deleting = ref(false)

onMounted(async () => {
  try {
    await categoriesStore.fetchCategories()
  } catch (err: any) {
    showToast(err?.message || 'Failed to load categories', 'error')
  }
})

function getTicketCount(cat: Category): number {
  return cat.activeTicketCount ?? cat.ticketCount ?? cat._count?.tickets ?? 0
}

function openCreateModal() {
  editingCategory.value = null
  nameInput.value = ''
  descriptionInput.value = ''
  formError.value = ''
  modalOpen.value = true
}

function openEditModal(cat: Category) {
  editingCategory.value = cat
  nameInput.value = cat.name
  descriptionInput.value = cat.description || ''
  formError.value = ''
  modalOpen.value = true
}

function closeModal() {
  if (saving.value) return
  modalOpen.value = false
}

async function handleSave() {
  formError.value = ''
  if (!nameInput.value.trim()) {
    formError.value = 'Category name is required.'
    return
  }

  saving.value = true
  try {
    if (editingCategory.value) {
      await categoriesStore.updateCategory(editingCategory.value.id, {
        name: nameInput.value.trim(),
        description: descriptionInput.value.trim(),
      })
      showToast('Category updated', 'success')
    } else {
      await categoriesStore.createCategory({
        name: nameInput.value.trim(),
        description: descriptionInput.value.trim(),
      })
      showToast('Category created', 'success')
    }
    modalOpen.value = false
  } catch (err: any) {
    const msg = err?.message || 'Failed to save category'
    formError.value = msg
    showToast(msg, 'error')
  } finally {
    saving.value = false
  }
}

function openDeleteModal(cat: Category) {
  if (getTicketCount(cat) > 0) return
  deleteTarget.value = cat
}

async function handleConfirmDelete() {
  if (!deleteTarget.value) return
  deleting.value = true
  try {
    await categoriesStore.deleteCategory(deleteTarget.value.id)
    showToast('Category deleted', 'success')
    deleteTarget.value = null
  } catch (err: any) {
    showToast(err?.message || 'Cannot delete category', 'error')
  } finally {
    deleting.value = false
  }
}
</script>

<template>
  <div>
    <div class="page-header">
      <h2 class="page-title">Categories</h2>
      <button type="button" class="btn btn-primary" @click="openCreateModal">
        + Add Category
      </button>
    </div>

    <div v-if="categoriesStore.loading" class="cards-grid">
      <div v-for="n in 6" :key="n" class="card">
        <div class="skeleton skeleton-card-title"></div>
        <div class="skeleton skeleton-card-desc"></div>
      </div>
    </div>

    <div v-else-if="categoriesStore.categories.length === 0" class="card empty-state">
      <h3>No categories yet</h3>
      <p>Add your first support category to organize incoming tickets.</p>
      <button type="button" class="btn btn-primary" @click="openCreateModal">
        + Add Category
      </button>
    </div>

    <div v-else class="cards-grid">
      <div v-for="cat in categoriesStore.categories" :key="cat.id" class="card category-card">
        <div class="card-top">
          <div class="cat-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </div>
          <div class="card-actions">
            <button
              type="button"
              class="btn-icon"
              title="Edit category"
              @click="openEditModal(cat)"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </button>
            <span
              class="delete-btn-wrapper"
              :title="
                getTicketCount(cat) > 0
                  ? 'Cannot delete a category with active tickets'
                  : 'Delete category'
              "
            >
              <button
                type="button"
                class="btn-icon"
                :disabled="getTicketCount(cat) > 0"
                @click="openDeleteModal(cat)"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </button>
            </span>
          </div>
        </div>

        <h3 class="cat-name">{{ cat.name }}</h3>
        <p class="cat-description">{{ cat.description || 'No description provided.' }}</p>

        <div class="cat-footer">
          <span class="badge badge-gray">{{ getTicketCount(cat) }} tickets</span>
        </div>
      </div>
    </div>

    <div v-if="modalOpen" class="modal-backdrop" @click.self="closeModal">
      <div class="card modal-card" role="dialog" aria-modal="true">
        <h3 class="modal-title">
          {{ editingCategory ? 'Edit Category' : 'Add Category' }}
        </h3>

        <div v-if="formError" class="alert-error">{{ formError }}</div>

        <form @submit.prevent="handleSave" novalidate>
          <div class="form-group">
            <label for="cat-name" class="form-label">Name</label>
            <input
              id="cat-name"
              v-model="nameInput"
              type="text"
              class="form-input"
              placeholder="e.g. Hardware"
              required
            />
          </div>

          <div class="form-group">
            <label for="cat-desc" class="form-label">Description</label>
            <textarea
              id="cat-desc"
              v-model="descriptionInput"
              class="form-textarea"
              placeholder="Short description of issues in this category..."
            ></textarea>
          </div>

          <div class="modal-actions">
            <button
              type="button"
              class="btn btn-secondary"
              :disabled="saving"
              @click="closeModal"
            >
              Cancel
            </button>
            <button type="submit" class="btn btn-primary" :disabled="saving">
              {{ saving ? 'Saving...' : 'Save' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <ConfirmModal
      :open="Boolean(deleteTarget)"
      title="Delete Category"
      :message="`Are you sure you want to delete &quot;${deleteTarget?.name ?? ''}&quot;?`"
      confirm-label="Delete"
      :danger="true"
      :loading="deleting"
      @confirm="handleConfirmDelete"
      @cancel="deleteTarget = null"
    />
  </div>
</template>

<style scoped>
.cards-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.25rem;
}

.category-card {
  display: flex;
  flex-direction: column;
}

.card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.85rem;
}

.cat-icon {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 10px;
  background: var(--primary-light);
  color: var(--primary);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.card-actions {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.delete-btn-wrapper {
  display: inline-flex;
}

.cat-name {
  font-size: 1.05rem;
  font-weight: 600;
  margin-bottom: 0.35rem;
}

.cat-description {
  font-size: 0.875rem;
  color: var(--text-muted);
  flex: 1;
  margin-bottom: 1rem;
}

.cat-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
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
  max-width: 460px;
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

.skeleton-card-title {
  height: 24px;
  width: 55%;
  margin-bottom: 0.75rem;
}

.skeleton-card-desc {
  height: 54px;
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
}
</style>

