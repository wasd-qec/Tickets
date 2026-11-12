<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import { api } from '@/services/api'
import type { Priority } from '@/Data/Ticket'
import type { Category } from '@/Data/Categories'

const router = useRouter()
const auth = useAuthStore()
const { showToast } = useToast()

const categories = ref<Category[]>([])
const title = ref('')
const description = ref('')
const priority = ref<Priority>('Medium')
const categoryId = ref<number | ''>('')

const titleError = ref('')
const categoryError = ref('')
const submitError = ref('')
const isSubmitting = ref(false)

async function fetchCategories() {
  try {
    categories.value = await api.getCategories()
    const firstCat = categories.value[0]
    if (firstCat && categoryId.value === '') {
      categoryId.value = firstCat.CategroyID
    }
  } catch {
    submitError.value = 'Failed to load categories. Please ensure mock API server is running.'
  }
}

onMounted(() => {
  fetchCategories()
})

async function handleSubmit() {
  titleError.value = ''
  categoryError.value = ''
  submitError.value = ''

  if (!title.value.trim()) {
    titleError.value = 'Title is required.'
  }
  if (!categoryId.value) {
    categoryError.value = 'Please select a category.'
  }

  if (titleError.value || categoryError.value) return

  if (!auth.currentUser) {
    submitError.value = 'You must be logged in to create a ticket.'
    return
  }

  isSubmitting.value = true
  try {
    const now = new Date().toISOString()
    const numericId = Math.floor(1000 + Math.random() * 9000)
    const newTicket = await api.createTicket({
      TicketID: numericId,
      Name: title.value.trim(),
      Description: description.value.trim(),
      Stage: 'Opened',
      Priority: priority.value,
      CategoryID: Number(categoryId.value),
      CreateBy: auth.currentUser.id,
      CreateAt: now,
      UpdatedAt: now,
    })

    showToast('Ticket created successfully!', 'success')
    const targetId = newTicket.id || newTicket.TicketID || numericId
    router.push(`/tickets/${targetId}`)
  } catch {
    submitError.value = 'Failed to create ticket. Please check connection and try again.'
    showToast('Error creating ticket', 'error')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="new-ticket-page">
    <div class="page-header">
      <h1 class="page-title">Submit a New Support Ticket</h1>
      <p class="page-subtitle">Describe your issue in detail so our IT team can assist you quickly.</p>
    </div>

    <div class="form-card">
      <div v-if="submitError" class="alert-error">
        {{ submitError }}
      </div>

      <form class="ticket-form" @submit.prevent="handleSubmit" novalidate>
        <div class="form-group">
          <label for="ticket-title">Title <span class="req">*</span></label>
          <input
            id="ticket-title"
            v-model="title"
            type="text"
            placeholder="Brief summary of the issue (e.g. Printer offline in Room 204)"
            required
          />
          <span v-if="titleError" class="field-error">{{ titleError }}</span>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="ticket-category">Category <span class="req">*</span></label>
            <select id="ticket-category" v-model="categoryId" required>
              <option value="" disabled>Select category</option>
              <option v-for="cat in categories" :key="cat.CategroyID" :value="cat.CategroyID">
                {{ cat.name }}
              </option>
            </select>
            <span v-if="categoryError" class="field-error">{{ categoryError }}</span>
          </div>

          <div class="form-group">
            <label for="ticket-priority">Priority</label>
            <select id="ticket-priority" v-model="priority">
              <option value="Low">Low - Minor issue</option>
              <option value="Medium">Medium - Normal request</option>
              <option value="High">High - Urgent / Blocking</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label for="ticket-desc">Description</label>
          <textarea
            id="ticket-desc"
            v-model="description"
            rows="6"
            placeholder="Steps to reproduce, error codes, device info, or any extra context..."
          ></textarea>
        </div>

        <div class="form-actions">
          <button type="button" class="btn-cancel" @click="router.back()">Cancel</button>
          <button type="submit" class="btn-submit" :disabled="isSubmitting">
            {{ isSubmitting ? 'Creating Ticket...' : 'Submit Ticket' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.new-ticket-page {
  max-width: 720px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.page-header {
  text-align: left;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 0.25rem 0;
}

.page-subtitle {
  color: #64748b;
  font-size: 0.9rem;
  margin: 0;
}

.form-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.alert-error {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #b91c1c;
  padding: 0.75rem 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
  margin-bottom: 1.25rem;
}

.ticket-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

@media (max-width: 640px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.form-group label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #334155;
}

.req {
  color: #dc2626;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 0.65rem 0.85rem;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 0.9rem;
  outline: none;
  background: #ffffff;
  font-family: inherit;
  color: #0f172a;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.15);
}

.field-error {
  color: #dc2626;
  font-size: 0.75rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 0.5rem;
  padding-top: 1rem;
  border-top: 1px solid #f1f5f9;
}

.btn-cancel {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  color: #475569;
  padding: 0.6rem 1.2rem;
  border-radius: 6px;
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
}

.btn-cancel:hover {
  background: #f8fafc;
}

.btn-submit {
  background: #2563eb;
  border: none;
  color: #ffffff;
  padding: 0.6rem 1.4rem;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background 0.15s ease;
}

.btn-submit:hover:not(:disabled) {
  background: #1d4ed8;
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
