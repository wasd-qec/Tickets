<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useCategoriesStore } from '@/stores/categories'
import { useTicketsStore } from '@/stores/tickets'
import { useToast } from '@/composables/useToast'

const categoriesStore = useCategoriesStore()
const ticketsStore = useTicketsStore()
const router = useRouter()
const { showToast } = useToast()

const title = ref('')
const description = ref('')
const categoryId = ref<string | number>('')
const submitting = ref(false)
const formError = ref('')

onMounted(async () => {
  try {
    await categoriesStore.fetchCategories()
    if (categoriesStore.categories.length > 0 && categoriesStore.categories[0]) {
      categoryId.value = categoriesStore.categories[0].id
    }
  } catch (err: any) {
    showToast(err?.message || 'Failed to load categories', 'error')
  }
})

async function handleSubmit() {
  formError.value = ''
  if (!title.value.trim() || !description.value.trim() || categoryId.value === '') {
    formError.value = 'Please fill in title, category, and description.'
    return
  }

  submitting.value = true
  try {
    const ticket = await ticketsStore.createTicket({
      title: title.value.trim(),
      description: description.value.trim(),
      categoryId: categoryId.value,
    })
    showToast('Ticket created successfully', 'success')
    router.push(`/tickets/${ticket.id}`)
  } catch (err: any) {
    const msg = err?.message || 'Failed to create ticket'
    formError.value = msg
    showToast(msg, 'error')
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="new-ticket-wrapper">
    <div class="page-header">
      <h2 class="page-title">New Ticket</h2>
    </div>

    <div class="card form-card">
      <div v-if="formError" class="alert-error">
        {{ formError }}
      </div>

      <form @submit.prevent="handleSubmit" novalidate>
        <div class="form-group">
          <label for="ticket-title" class="form-label">Title</label>
          <input
            id="ticket-title"
            v-model="title"
            type="text"
            class="form-input"
            placeholder="Brief summary of the issue"
            required
          />
        </div>

        <div class="form-group">
          <label for="ticket-category" class="form-label">Category</label>
          <select
            id="ticket-category"
            v-model="categoryId"
            class="form-select"
            :disabled="categoriesStore.loading"
            required
          >
            <option value="" disabled>Select a category</option>
            <option
              v-for="cat in categoriesStore.categories"
              :key="cat.id"
              :value="cat.id"
            >
              {{ cat.name }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label for="ticket-description" class="form-label">Description</label>
          <textarea
            id="ticket-description"
            v-model="description"
            class="form-textarea"
            placeholder="Describe what happened, steps to reproduce, and any error messages..."
            required
          ></textarea>
        </div>

        <p class="auto-note">Priority and status are set automatically.</p>

        <div class="form-actions">
          <button type="submit" class="btn btn-primary" :disabled="submitting">
            {{ submitting ? 'Submitting...' : 'Submit' }}
          </button>
          <RouterLink to="/tickets" class="cancel-link">Cancel</RouterLink>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.new-ticket-wrapper {
  max-width: 680px;
}

.form-card {
  padding: 1.75rem;
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

.auto-note {
  font-size: 0.825rem;
  color: var(--text-muted);
  background: #f8fafc;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 0.6rem 0.85rem;
  margin-bottom: 1.25rem;
}

.form-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.cancel-link {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-muted);
}

.cancel-link:hover {
  color: var(--text);
}
</style>

