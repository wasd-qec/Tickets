<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useTicketsStore } from '@/stores/tickets'
import { useCategoriesStore } from '@/stores/categories'
import { useToast } from '@/composables/useToast'
import StatusBadge from '@/components/StatusBadge.vue'
import PriorityBadge from '@/components/PriorityBadge.vue'
import type { Ticket, TicketPriority, TicketStatus } from '@/types'

const ticketsStore = useTicketsStore()
const categoriesStore = useCategoriesStore()
const router = useRouter()
const { showToast } = useToast()

const search = ref('')
const groupToggle = ref<'ACTIVE' | 'COMPLETED'>('ACTIVE')
const statusFilter = ref<string>('')
const priorityFilter = ref<string>('')
const categoryFilter = ref<string>('')
const currentPage = ref(1)
const pageSize = 10

const activeStatuses: TicketStatus[] = ['OPEN', 'IN_PROGRESS']
const completedStatuses: TicketStatus[] = ['RESOLVED', 'CLOSED', 'CANCELLED']

const statusOptions = computed(() => {
  if (groupToggle.value === 'ACTIVE') {
    return [
      { label: 'Open', value: 'OPEN' },
      { label: 'In Progress', value: 'IN_PROGRESS' },
    ]
  }
  return [
    { label: 'Resolved', value: 'RESOLVED' },
    { label: 'Closed', value: 'CLOSED' },
    { label: 'Cancelled', value: 'CANCELLED' },
  ]
})

async function loadQueue() {
  try {
    await ticketsStore.fetchTickets({
      page: currentPage.value,
      limit: pageSize,
      search: search.value.trim() || undefined,
      status: statusFilter.value || undefined,
      priority: priorityFilter.value || undefined,
      categoryId: categoryFilter.value || undefined,
    })
  } catch (err: any) {
    showToast(err?.message || 'Failed to load ticket queue', 'error')
  }
}

onMounted(() => {
  categoriesStore.fetchCategories().catch(() => {})
  loadQueue()
})

watch([groupToggle, statusFilter, priorityFilter, categoryFilter], () => {
  currentPage.value = 1
  loadQueue()
})

let searchTimeout: ReturnType<typeof setTimeout> | null = null
function onSearchInput() {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
    loadQueue()
  }, 250)
}

function setToggle(mode: 'ACTIVE' | 'COMPLETED') {
  if (groupToggle.value === mode) return
  statusFilter.value = ''
  groupToggle.value = mode
}

function resetFilters() {
  search.value = ''
  groupToggle.value = 'ACTIVE'
  statusFilter.value = ''
  priorityFilter.value = ''
  categoryFilter.value = ''
  currentPage.value = 1
  loadQueue()
}

const displayedTickets = computed(() => {
  const allowed = groupToggle.value === 'ACTIVE' ? activeStatuses : completedStatuses
  return ticketsStore.tickets.filter((t) => {
    if (statusFilter.value) {
      if (t.status !== statusFilter.value) return false
    } else if (!allowed.includes(t.status)) {
      return false
    }
    if (priorityFilter.value && t.priority !== (priorityFilter.value as TicketPriority)) {
      return false
    }
    if (categoryFilter.value && String(t.categoryId ?? t.category?.id) !== String(categoryFilter.value)) {
      return false
    }
    if (search.value.trim()) {
      const q = search.value.trim().toLowerCase()
      const inTitle = t.title?.toLowerCase().includes(q)
      const inDesc = t.description?.toLowerCase().includes(q)
      if (!inTitle && !inDesc) return false
    }
    return true
  })
})

const totalPages = computed(() => Math.max(1, ticketsStore.totalPages || 1))

const pageNumbers = computed(() => {
  const pages: number[] = []
  for (let i = 1; i <= totalPages.value; i++) {
    pages.push(i)
  }
  return pages
})

function goToPage(p: number) {
  if (p < 1 || p > totalPages.value || p === currentPage.value) return
  currentPage.value = p
  loadQueue()
}

function getAuthorName(ticket: Ticket): string {
  return ticket.author?.username || ticket.createdBy?.username || ticket.authorUsername || 'Client'
}

function getCategoryName(ticket: Ticket): string {
  if (ticket.category?.name) return ticket.category.name
  if (ticket.categoryName) return ticket.categoryName
  const match = categoriesStore.categories.find((c) => String(c.id) === String(ticket.categoryId))
  return match?.name || 'General'
}

function getAssigneeName(ticket: Ticket): string | null {
  return ticket.assignedTo?.username || ticket.assignedTechnician?.username || null
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

function formatRelativeTime(iso: string): string {
  if (!iso) return '—'
  const diffSec = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000))
  if (diffSec < 60) return 'just now'
  const diffMin = Math.floor(diffSec / 60)
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) return `${diffHr}h ago`
  const diffDays = Math.floor(diffHr / 24)
  if (diffDays < 30) return `${diffDays}d ago`
  const diffMonths = Math.floor(diffDays / 30)
  return `${diffMonths}mo ago`
}

function formatExactTime(iso: string): string {
  if (!iso) return ''
  return new Date(iso).toLocaleString()
}

function goToTicket(id: string | number) {
  router.push(`/tickets/${id}`)
}
</script>

<template>
  <div>
    <div class="page-header">
      <h2 class="page-title">Ticket Queue</h2>

      <div class="toggle-group" role="group" aria-label="Queue status group">
        <button
          type="button"
          class="toggle-btn"
          :class="{ active: groupToggle === 'ACTIVE' }"
          @click="setToggle('ACTIVE')"
        >
          Active
        </button>
        <button
          type="button"
          class="toggle-btn"
          :class="{ active: groupToggle === 'COMPLETED' }"
          @click="setToggle('COMPLETED')"
        >
          Completed
        </button>
      </div>
    </div>

    <div class="card filters-bar">
      <div class="search-wrap">
        <input
          v-model="search"
          type="search"
          class="form-input"
          placeholder="Search keyword in title or description..."
          @input="onSearchInput"
        />
      </div>

      <div class="filter-controls">
        <select v-model="statusFilter" class="form-select filter-select" aria-label="Status filter">
          <option value="">All Statuses</option>
          <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>

        <select v-model="priorityFilter" class="form-select filter-select" aria-label="Priority filter">
          <option value="">All Priorities</option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
        </select>

        <select v-model="categoryFilter" class="form-select filter-select" aria-label="Category filter">
          <option value="">All Categories</option>
          <option v-for="cat in categoriesStore.categories" :key="cat.id" :value="String(cat.id)">
            {{ cat.name }}
          </option>
        </select>

        <button type="button" class="reset-link" @click="resetFilters">
          Reset filters
        </button>
      </div>
    </div>

    <div v-if="ticketsStore.loading" class="card">
      <div v-for="n in 6" :key="n" class="skeleton-row">
        <div class="skeleton skeleton-line"></div>
      </div>
    </div>

    <div v-else-if="displayedTickets.length === 0" class="card empty-state">
      <h3>No matching tickets</h3>
      <p>Try adjusting your search or filter criteria.</p>
      <button type="button" class="btn btn-secondary" @click="resetFilters">
        Reset filters
      </button>
    </div>

    <template v-else>
      <div class="card queue-table-card desktop-only">
        <table class="queue-table">
          <thead>
            <tr>
              <th class="col-id">ID</th>
              <th class="col-title">Title</th>
              <th class="col-priority">Priority</th>
              <th class="col-status">Status</th>
              <th class="col-assigned">Assigned To</th>
              <th class="col-updated">Updated</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="ticket in displayedTickets"
              :key="ticket.id"
              class="clickable-row"
              @click="goToTicket(ticket.id)"
            >
              <td class="col-id">#{{ ticket.id }}</td>
              <td class="col-title">
                <div class="title-line1" :title="ticket.title">{{ ticket.title }}</div>
                <div class="title-line2">
                  {{ getAuthorName(ticket) }} &middot; {{ getCategoryName(ticket) }}
                </div>
              </td>
              <td class="col-priority">
                <PriorityBadge :priority="ticket.priority" />
              </td>
              <td class="col-status">
                <StatusBadge :status="ticket.status" />
              </td>
              <td class="col-assigned">
                <span
                  v-if="getAssigneeName(ticket)"
                  class="assignee-text"
                  :title="`Assigned to ${getAssigneeName(ticket)}`"
                >
                  {{ getAssigneeName(ticket) }}
                </span>
                <span
                  v-else
                  class="assignee-unassigned"
                  title="Unassigned"
                >
                  Unassigned
                </span>
              </td>
              <td class="col-updated">
                <span class="updated-time" :title="formatExactTime(ticket.updatedAt)">
                  {{ formatRelativeTime(ticket.updatedAt) }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="mobile-cards mobile-only">
        <div
          v-for="ticket in displayedTickets"
          :key="ticket.id"
          class="card mobile-ticket-card"
          @click="goToTicket(ticket.id)"
        >
          <div class="mobile-card-top">
            <span class="mobile-id">#{{ ticket.id }}</span>
            <div class="mobile-badges">
              <PriorityBadge :priority="ticket.priority" />
              <StatusBadge :status="ticket.status" />
            </div>
          </div>
          <div class="mobile-title">{{ ticket.title }}</div>
          <div class="mobile-meta">
            {{ getAuthorName(ticket) }} &middot; {{ getCategoryName(ticket) }}
          </div>
          <div class="mobile-card-bottom">
            <div class="mobile-assignee">
              <span
                v-if="getAssigneeName(ticket)"
                class="avatar"
                :title="`Assigned to ${getAssigneeName(ticket)}`"
              >
                {{ getInitials(getAssigneeName(ticket)!) }}
              </span>
              <span v-else class="avatar avatar-unassigned" title="Unassigned">—</span>
              <span class="mobile-assignee-label">
                {{ getAssigneeName(ticket) || 'Unassigned' }}
              </span>
            </div>
            <span class="updated-time" :title="formatExactTime(ticket.updatedAt)">
              {{ formatRelativeTime(ticket.updatedAt) }}
            </span>
          </div>
        </div>
      </div>

      <div class="pagination-bar">
        <button
          type="button"
          class="btn btn-secondary btn-sm"
          :disabled="currentPage <= 1 || ticketsStore.loading"
          @click="goToPage(currentPage - 1)"
        >
          Prev
        </button>
        <div class="page-numbers">
          <button
            v-for="p in pageNumbers"
            :key="p"
            type="button"
            class="page-num-btn"
            :class="{ active: p === currentPage }"
            @click="goToPage(p)"
          >
            {{ p }}
          </button>
        </div>
        <button
          type="button"
          class="btn btn-secondary btn-sm"
          :disabled="currentPage >= totalPages || ticketsStore.loading"
          @click="goToPage(currentPage + 1)"
        >
          Next
        </button>
      </div>
    </template>
  </div>
</template>

<style scoped>
.toggle-group {
  display: inline-flex;
  background: #e2e8f0;
  padding: 0.2rem;
  border-radius: var(--radius-sm);
}

.toggle-btn {
  border: none;
  background: transparent;
  padding: 0.4rem 0.9rem;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-muted);
  cursor: pointer;
}

.toggle-btn.active {
  background: var(--surface);
  color: var(--primary);
  box-shadow: var(--shadow);
}

.filters-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
}

.search-wrap {
  flex: 1;
  min-width: 220px;
}

.filter-controls {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-wrap: wrap;
}

.filter-select {
  width: auto;
  min-width: 140px;
}

.reset-link {
  background: transparent;
  border: none;
  color: var(--primary);
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  padding: 0.25rem 0.4rem;
}

.reset-link:hover {
  text-decoration: underline;
}

.queue-table-card {
  padding: 0;
  overflow: hidden;
}

.queue-table {
  width: 100%;
  table-layout: fixed;
  border-collapse: collapse;
  text-align: left;
}

.queue-table th {
  padding: 0.85rem 1rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: var(--text-muted);
  background: #f8fafc;
  border-bottom: 1px solid var(--border);
}

.queue-table td {
  padding: 0.85rem 1rem;
  border-bottom: 1px solid var(--border);
  font-size: 0.875rem;
  vertical-align: middle;
}

.queue-table tbody tr:last-child td {
  border-bottom: none;
}

.col-id {
  width: 72px;
  color: var(--text-muted);
  font-weight: 600;
}

.col-title {
  width: 40%;
}

.col-priority {
  width: 110px;
}

.col-status {
  width: 130px;
}

.col-assigned {
  width: 140px;
}

.col-updated {
  width: 100px;
}

.title-line1 {
  font-weight: 600;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.title-line2 {
  font-size: 0.78rem;
  color: var(--text-muted);
  margin-top: 0.15rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.clickable-row {
  cursor: pointer;
  transition: background-color 0.12s;
}

.clickable-row:hover {
  background-color: #f8fafc;
}

.updated-time {
  color: var(--text-muted);
  font-size: 0.825rem;
  white-space: nowrap;
}

.assignee-text {
  font-weight: 500;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
}

.assignee-unassigned {
  color: var(--text-muted);
  font-style: italic;
  font-size: 0.85rem;
  white-space: nowrap;
}

.pagination-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1.25rem;
}

.page-numbers {
  display: flex;
  gap: 0.25rem;
}

.page-num-btn {
  min-width: 2rem;
  height: 2rem;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text);
  font-size: 0.825rem;
  font-weight: 500;
  cursor: pointer;
}

.page-num-btn.active {
  background: var(--primary);
  color: #ffffff;
  border-color: var(--primary);
}

.mobile-only {
  display: none;
}

.skeleton-row {
  padding: 0.65rem 0;
}

.skeleton-line {
  height: 40px;
  width: 100%;
}

@media (max-width: 768px) {
  .desktop-only {
    display: none;
  }

  .mobile-only {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .mobile-ticket-card {
    cursor: pointer;
  }

  .mobile-card-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.5rem;
  }

  .mobile-id {
    font-weight: 600;
    font-size: 0.8rem;
    color: var(--text-muted);
  }

  .mobile-badges {
    display: flex;
    gap: 0.4rem;
  }

  .mobile-title {
    font-weight: 600;
    font-size: 0.95rem;
    margin-bottom: 0.25rem;
  }

  .mobile-meta {
    font-size: 0.8rem;
    color: var(--text-muted);
    margin-bottom: 0.75rem;
  }

  .mobile-card-bottom {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 0.6rem;
    border-top: 1px solid var(--border);
  }

  .mobile-assignee {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .mobile-assignee-label {
    font-size: 0.8rem;
    color: var(--text-muted);
  }
}
</style>

