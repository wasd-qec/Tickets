<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '@/services/api'
import type { Priority, Stage, Tickets } from '@/Data/Ticket'
import type { Category } from '@/Data/Categories'
import type { User } from '@/Data/User'
import StatusBadge from '@/components/StatusBadge.vue'
import PriorityBadge from '@/components/PriorityBadge.vue'

const router = useRouter()

const tickets = ref<Tickets[]>([])
const categories = ref<Category[]>([])
const users = ref<User[]>([])
const isLoading = ref(true)
const errorMessage = ref('')

const search = ref('')
const activeToggle = ref<'Active' | 'Completed'>('Active')
const statusFilter = ref<Stage | ''>('')
const priorityFilter = ref<Priority | ''>('')
const categoryFilter = ref<number | ''>('')
const currentPage = ref(1)
const pageSize = 10

const activeStages: Stage[] = ['Opened', 'In Progress']
const completedStages: Stage[] = ['Resolved', 'Closed', 'Cancelled']

const availableStages = computed(() => {
  return activeToggle.value === 'Active' ? activeStages : completedStages
})

async function fetchData() {
  isLoading.value = true
  errorMessage.value = ''
  try {
    const [tData, cData, uData] = await Promise.all([
      api.getTickets(),
      api.getCategories(),
      api.getUsers(),
    ])
    tickets.value = tData
    categories.value = cData
    users.value = uData
  } catch (err) {
    errorMessage.value = 'Failed to load tickets. Please ensure mock API server is running.'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchData()
})

function setToggle(toggle: 'Active' | 'Completed') {
  activeToggle.value = toggle
  statusFilter.value = ''
  currentPage.value = 1
}

function resetFilters() {
  search.value = ''
  activeToggle.value = 'Active'
  statusFilter.value = ''
  priorityFilter.value = ''
  categoryFilter.value = ''
  currentPage.value = 1
}

const filteredTickets = computed(() => {
  return tickets.value.filter((t) => {
    const inActiveGroup =
      activeToggle.value === 'Active'
        ? activeStages.includes(t.Stage)
        : completedStages.includes(t.Stage)
    if (!inActiveGroup) return false

    if (statusFilter.value && t.Stage !== statusFilter.value) return false
    if (priorityFilter.value && t.Priority !== priorityFilter.value) return false
    if (categoryFilter.value !== '' && t.CategoryID !== categoryFilter.value) return false

    if (search.value.trim()) {
      const q = search.value.trim().toLowerCase()
      const matchTitle = t.Name.toLowerCase().includes(q)
      const matchDesc = t.Description?.toLowerCase().includes(q) || false
      if (!matchTitle && !matchDesc) return false
    }

    return true
  })
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredTickets.value.length / pageSize)))

const paginatedTickets = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredTickets.value.slice(start, start + pageSize)
})

function getCategoryName(categoryId: number) {
  const found = categories.value.find((c) => c.CategroyID === categoryId)
  return found ? String(found.name) : 'General'
}

function getAuthorName(authorId: number) {
  const found = users.value.find((u) => u.id === authorId)
  return found ? found.username : `User #${authorId}`
}

function getAssigneeName(assigneeId?: number) {
  if (!assigneeId) return null
  const found = users.value.find((u) => u.id === assigneeId)
  return found ? found.username : `User #${assigneeId}`
}

function formatRelativeTime(iso: string) {
  const diffSec = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000))
  if (diffSec < 60) return 'just now'
  const diffMin = Math.floor(diffSec / 60)
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) return `${diffHr}h ago`
  const diffDays = Math.floor(diffHr / 24)
  return `${diffDays}d ago`
}

function goToDetail(id: string | number) {
  router.push(`/tickets/${id}`)
}
</script>

<template>
  <div class="queue-page">
    <div class="page-header">
      <h1 class="page-title">Ticket Queue</h1>

      <div class="toggle-group">
        <button
          type="button"
          class="toggle-btn"
          :class="{ active: activeToggle === 'Active' }"
          @click="setToggle('Active')"
        >
          Active
        </button>
        <button
          type="button"
          class="toggle-btn"
          :class="{ active: activeToggle === 'Completed' }"
          @click="setToggle('Completed')"
        >
          Completed
        </button>
      </div>
    </div>

    <div class="filter-card">
      <div class="search-box">
        <input
          v-model="search"
          type="search"
          placeholder="Search keyword in title or description..."
          class="form-input"
        />
      </div>

      <div class="filter-controls">
        <select v-model="statusFilter" class="form-select">
          <option value="">All Statuses</option>
          <option v-for="st in availableStages" :key="st" :value="st">{{ st }}</option>
        </select>

        <select v-model="priorityFilter" class="form-select">
          <option value="">All Priorities</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>

        <select v-model="categoryFilter" class="form-select">
          <option value="">All Categories</option>
          <option v-for="cat in categories" :key="cat.CategroyID" :value="cat.CategroyID">
            {{ cat.name }}
          </option>
        </select>

        <button type="button" class="btn-reset" @click="resetFilters">Reset filters</button>
      </div>
    </div>

    <div v-if="isLoading" class="state-card">
      <div class="spinner"></div>
      <p class="state-text">Loading tickets...</p>
    </div>

    <div v-else-if="errorMessage" class="state-card error-card">
      <p class="error-text">{{ errorMessage }}</p>
      <button type="button" class="btn-primary" @click="fetchData">Retry</button>
    </div>

    <div v-else-if="paginatedTickets.length === 0" class="empty-card">
      <p class="empty-title">No tickets match your filters</p>
      <p class="empty-subtitle">Try adjusting your search query or filter selections.</p>
      <button type="button" class="btn-primary" @click="resetFilters">Reset all filters</button>
    </div>

    <div v-else class="table-card">
      <table class="queue-table">
        <thead>
          <tr>
            <th class="col-id">ID</th>
            <th class="col-title">Title</th>
            <th class="col-priority">Priority</th>
            <th class="col-status">Status</th>
            <th class="col-assignee">Assigned To</th>
            <th class="col-updated">Updated</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="ticket in paginatedTickets"
            :key="(ticket as any).id || ticket.TicketID"
            class="clickable-row"
            @click="goToDetail((ticket as any).id || ticket.TicketID)"
          >
            <td class="col-id">#{{ ticket.TicketID || (ticket as any).id }}</td>
            <td class="col-title">
              <div class="title-line1">{{ ticket.Name }}</div>
              <div class="title-line2">
                {{ getAuthorName(ticket.CreateBy) }} &middot; {{ getCategoryName(ticket.CategoryID) }}
              </div>
            </td>
            <td class="col-priority">
              <PriorityBadge :priority="ticket.Priority" />
            </td>
            <td class="col-status">
              <StatusBadge :Stage="ticket.Stage" />
            </td>
            <td class="col-assignee">
              <span v-if="getAssigneeName(ticket.Assignto)" class="assignee-text">
                {{ getAssigneeName(ticket.Assignto) }}
              </span>
              <span v-else class="assignee-unassigned">Unassigned</span>
            </td>
            <td class="col-updated" :title="new Date(ticket.UpdatedAt).toLocaleString()">
              {{ formatRelativeTime(ticket.UpdatedAt) }}
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="totalPages > 1" class="pagination-bar">
        <button
          type="button"
          class="page-btn"
          :disabled="currentPage === 1"
          @click="currentPage--"
        >
          Prev
        </button>
        <span class="page-info">Page {{ currentPage }} of {{ totalPages }}</span>
        <button
          type="button"
          class="page-btn"
          :disabled="currentPage === totalPages"
          @click="currentPage++"
        >
          Next
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.queue-page {
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

.toggle-group {
  display: inline-flex;
  border-radius: 8px;
  background: #f1f5f9;
  padding: 3px;
  border: 1px solid #e2e8f0;
}

.toggle-btn {
  padding: 0.4rem 0.9rem;
  border-radius: 6px;
  border: none;
  background: transparent;
  font-size: 0.875rem;
  font-weight: 500;
  color: #64748b;
  cursor: pointer;
  transition: all 0.15s ease;
}

.toggle-btn.active {
  background: #ffffff;
  color: #0f172a;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.filter-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.form-input {
  width: 100%;
  padding: 0.55rem 0.85rem;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 0.875rem;
  outline: none;
}

.form-input:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.15);
}

.filter-controls {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  align-items: center;
}

.form-select {
  padding: 0.5rem 0.75rem;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 0.875rem;
  background: #ffffff;
  color: #334155;
}

.btn-reset {
  background: none;
  border: none;
  color: #2563eb;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  padding: 0.4rem 0.5rem;
}

.btn-reset:hover {
  text-decoration: underline;
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

.btn-primary {
  background: #2563eb;
  color: #ffffff;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
}

.btn-primary:hover {
  background: #1d4ed8;
}

.table-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  overflow: hidden;
}

.queue-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
  text-align: left;
}

.queue-table th {
  background: #f8fafc;
  color: #475569;
  font-weight: 600;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #e2e8f0;
}

.queue-table td {
  padding: 0.85rem 1rem;
  border-bottom: 1px solid #f1f5f9;
  color: #1e293b;
  vertical-align: middle;
}

.clickable-row {
  cursor: pointer;
  transition: background-color 0.12s ease;
}

.clickable-row:hover {
  background-color: #f8fafc;
}

.col-id {
  width: 70px;
  font-weight: 600;
  color: #64748b;
}

.col-title {
  min-width: 260px;
}

.title-line1 {
  font-weight: 600;
  color: #0f172a;
}

.title-line2 {
  font-size: 0.75rem;
  color: #64748b;
  margin-top: 2px;
}

.col-priority {
  width: 100px;
}

.col-status {
  width: 120px;
}

.col-assignee {
  width: 140px;
}

.assignee-text {
  font-weight: 500;
  color: #334155;
}

.assignee-unassigned {
  color: #94a3b8;
  font-style: italic;
}

.col-updated {
  width: 110px;
  color: #64748b;
  font-size: 0.8rem;
}

.pagination-bar {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
}

.page-btn {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  padding: 0.35rem 0.75rem;
  font-size: 0.8rem;
  cursor: pointer;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  font-size: 0.8rem;
  color: #64748b;
}
</style>
