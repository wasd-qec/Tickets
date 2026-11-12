<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { api } from '@/services/api'
import type { Stage, Tickets } from '@/Data/Ticket'
import type { Category } from '@/Data/Categories'
import StatusBadge from '@/components/StatusBadge.vue'
import PriorityBadge from '@/components/PriorityBadge.vue'

const router = useRouter()
const auth = useAuthStore()

const tickets = ref<Tickets[]>([])
const categories = ref<Category[]>([])
const isLoading = ref(true)
const errorMessage = ref('')

const filter = ref<'all' | 'open' | 'closed'>('all')

async function fetchData() {
  isLoading.value = true
  errorMessage.value = ''
  try {
    const [tData, cData] = await Promise.all([
      api.getTickets(),
      api.getCategories(),
    ])
    tickets.value = tData
    categories.value = cData
  } catch {
    errorMessage.value = 'Failed to load tickets. Please ensure mock API server is running.'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchData()
})

const myTickets = computed(() => {
  const currentUserId = auth.currentUser?.id
  if (!currentUserId) return []
  return tickets.value.filter((t) => t.CreateBy === currentUserId)
})

const filteredTickets = computed(() => {
  const openStages: Stage[] = ['Opened', 'In Progress']
  const closedStages: Stage[] = ['Resolved', 'Closed', 'Cancelled']

  if (filter.value === 'open') {
    return myTickets.value.filter((t) => openStages.includes(t.Stage))
  }
  if (filter.value === 'closed') {
    return myTickets.value.filter((t) => closedStages.includes(t.Stage))
  }
  return myTickets.value
})

function getCategoryName(categoryId: number) {
  const found = categories.value.find((c) => c.CategroyID === categoryId)
  return found ? String(found.name) : 'General'
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function goToDetail(id: number) {
  router.push(`/tickets/${id}`)
}
</script>

<template>
  <div class="my-tickets-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">My Tickets</h1>
        <p class="page-subtitle">Track the status of your reported issues</p>
      </div>

      <button type="button" class="btn-create" @click="router.push('/tickets/new')">
        + New Ticket
      </button>
    </div>

    <div class="tabs-card">
      <div class="filter-tabs">
        <button
          type="button"
          class="tab-btn"
          :class="{ active: filter === 'all' }"
          @click="filter = 'all'"
        >
          All ({{ myTickets.length }})
        </button>
        <button
          type="button"
          class="tab-btn"
          :class="{ active: filter === 'open' }"
          @click="filter = 'open'"
        >
          Open
        </button>
        <button
          type="button"
          class="tab-btn"
          :class="{ active: filter === 'closed' }"
          @click="filter = 'closed'"
        >
          Resolved / Closed
        </button>
      </div>
    </div>

    <div v-if="isLoading" class="state-card">
      <div class="spinner"></div>
      <p class="state-text">Loading your tickets...</p>
    </div>

    <div v-else-if="errorMessage" class="state-card error-card">
      <p class="error-text">{{ errorMessage }}</p>
      <button type="button" class="btn-primary" @click="fetchData">Retry</button>
    </div>

    <div v-else-if="filteredTickets.length === 0" class="empty-card">
      <p class="empty-title">No tickets found</p>
      <p class="empty-subtitle">
        {{
          filter === 'all'
            ? "You haven't submitted any support tickets yet."
            : 'No tickets match the selected status filter.'
        }}
      </p>
      <button
        v-if="filter === 'all'"
        type="button"
        class="btn-primary"
        @click="router.push('/tickets/new')"
      >
        Create your first ticket
      </button>
    </div>

    <div v-else class="tickets-grid">
      <div
        v-for="ticket in filteredTickets"
        :key="ticket.TicketID"
        class="ticket-card"
        @click="goToDetail(ticket.TicketID)"
      >
        <div class="ticket-header">
          <span class="ticket-id">#{{ ticket.TicketID }}</span>
          <div class="badges">
            <PriorityBadge :priority="ticket.Priority" />
            <StatusBadge :Stage="ticket.Stage" />
          </div>
        </div>

        <h3 class="ticket-title">{{ ticket.Name }}</h3>
        <p v-if="ticket.Description" class="ticket-desc">{{ ticket.Description }}</p>

        <div class="ticket-footer">
          <span class="category-tag">{{ getCategoryName(ticket.CategoryID) }}</span>
          <span class="ticket-date">{{ formatDate(ticket.CreateAt) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.my-tickets-page {
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

.tabs-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 0.5rem 0.75rem;
}

.filter-tabs {
  display: flex;
  gap: 0.5rem;
}

.tab-btn {
  padding: 0.45rem 0.85rem;
  border-radius: 6px;
  border: none;
  background: transparent;
  font-size: 0.875rem;
  font-weight: 500;
  color: #64748b;
  cursor: pointer;
}

.tab-btn.active {
  background: #f1f5f9;
  color: #0f172a;
  font-weight: 600;
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

.tickets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1rem;
}

.ticket-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 1.25rem;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  transition: transform 0.12s ease, box-shadow 0.12s ease;
}

.ticket-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.07);
}

.ticket-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.ticket-id {
  font-size: 0.8rem;
  font-weight: 700;
  color: #64748b;
}

.badges {
  display: flex;
  gap: 0.4rem;
}

.ticket-title {
  font-size: 1rem;
  font-weight: 600;
  color: #0f172a;
  margin: 0;
  line-height: 1.4;
}

.ticket-desc {
  font-size: 0.85rem;
  color: #64748b;
  margin: 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.ticket-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
  padding-top: 0.5rem;
  border-top: 1px solid #f1f5f9;
}

.category-tag {
  font-size: 0.75rem;
  background: #f1f5f9;
  color: #475569;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
}

.ticket-date {
  font-size: 0.75rem;
  color: #94a3b8;
}
</style>
