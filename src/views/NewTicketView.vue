<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import { mockTickets, mockCategories } from '@/Data/MockData'
import type { Tickets } from '@/Data/Ticket'

const router = useRouter()
const auth = useAuthStore()
const { showToast } = useToast()

const title = ref('')
const categoryId = ref<number | ''>('')
const details = ref('')
const error = ref('')

function handleSubmit() {
  error.value = ''
  if (!title.value.trim() || categoryId.value === '') {
    error.value = 'Please provide a title and select a category.'
    return
  }

  const newId = 100 + mockTickets.length + 1
  const newTicket: Tickets = {
    TicketID: newId,
    Name: title.value.trim(),
    Description: details.value.trim(),
    CategoryID: Number(categoryId.value),
    CreateBy: auth.currentUser?.id || 1,
    CreateAt: new Date().toISOString(),
    UpdatedAt: new Date().toISOString(),
    Stage: 'Opened',
    Priority: 'Medium',
  }

  mockTickets.unshift(newTicket)
  showToast(`Ticket #${newId} created successfully`, 'success')
  router.push(`/tickets/${newId}`)
}
</script>

<template>
  <div class="new-ticket-page">
    <div class="page-header">
      <h1 class="page-title">New Ticket</h1>
    </div>

    <div class="form-card">
      <div v-if="error" class="error-banner">
        {{ error }}
      </div>

      <form class="ticket-form" @submit.prevent="handleSubmit" novalidate>
        <div class="form-group">
          <label for="title">Title</label>
          <input
            id="title"
            v-model="title"
            type="text"
            placeholder="Brief summary of the issue"
            required
          />
        </div>

        <div class="form-group">
          <label for="category">Category</label>
          <select id="category" v-model="categoryId" required>
            <option value="" disabled>Select a category</option>
            <option
              v-for="cat in mockCategories"
              :key="cat.CategroyID"
              :value="cat.CategroyID"
            >
              {{ cat.name }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label for="details">Description</label>
          <textarea
            id="details"
            v-model="details"
            rows="5"
            placeholder="Provide context, steps to reproduce, or any error messages..."
          ></textarea>
        </div>

        <div class="info-note">
          Priority and status are set automatically.
        </div>

        <div class="form-actions">
          <button type="submit" class="btn btn-primary">Submit</button>
          <RouterLink to="/tickets" class="cancel-link">Cancel</RouterLink>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.new-ticket-page {
  max-width: 680px;
}

.page-header {
  margin-bottom: 1.5rem;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #0f172a;
}

.form-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.error-banner {
  background-color: #fee2e2;
  color: #b91c1c;
  padding: 0.75rem;
  border-radius: 6px;
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.ticket-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.form-group label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #0f172a;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 0.6rem 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.9rem;
  font-family: inherit;
  outline: none;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
}

.info-note {
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 0.75rem;
  font-size: 0.8125rem;
  color: #64748b;
}

.form-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.btn {
  padding: 0.6rem 1.25rem;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.875rem;
  border: none;
  cursor: pointer;
}

.btn-primary {
  background-color: #2563eb;
  color: #ffffff;
}

.btn-primary:hover {
  background-color: #1d4ed8;
}

.cancel-link {
  font-size: 0.875rem;
  color: #64748b;
  text-decoration: none;
  font-weight: 500;
}

.cancel-link:hover {
  color: #0f172a;
}
</style>
