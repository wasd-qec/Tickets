<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { api } from '@/services/api'
import type { Stage, Tickets } from '@/Data/Ticket'
import type { Category } from '@/Data/Categories'
import type { User } from '@/Data/User'
import StatusBadge from '@/components/StatusBadge.vue'
import PriorityBadge from '@/components/PriorityBadge.vue'

const router = useRouter()
const auth = useAuthStore()

const tickets = ref<Tickets[]>([])
const categories = ref<Category[]>([])
const users = ref<User[]>([])
const isLoading = ref(true)
const errorMessage = ref('')

const filter = ref<'all' | 'active' | 'resolved'>('all')

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
  } catch {
    errorMessage.value = 'Failed to load claimed tickets. Please ensure mock API server is running.'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchData()
})

const claimedTickets = computed(() => {
  const currentUserId = auth.currentUser?.id
  if (!currentUserId) return []
  return tickets.value.filter((t) => t.Assignto === currentUserId)
})

const filteredTickets = computed(() => {
  const activeStages: Stage[] = ['Opened', 'In Progress']
  const resolvedStages: Stage[] = ['Resolved', 'Closed', 'Cancelled']

  if (filter.value === 'active') {
    return claimedTickets.value.filter((t) => activeStages.includes(t.Stage))
  }
  if (filter.value === 'resolved') {
    return claimedTickets.value.filter((t) => resolvedStages.includes(t.Stage))
  }
  return claimedTickets.value
})

function getCategoryName(categoryId: number) {
  const found = categories.value.find((c) => c.CategroyID === categoryId)
  return found ? String(found.name) : 'General'
}

function getAuthorName(authorId: number) {
  const found = users.value.find((u) => u.id === authorId)
  return found ? found.username : `User #${authorId}`
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
  <div class="claimed-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">Claimed Tickets</h1>
        <p class="page-subtitle">Tickets currently assigned to you for resolution</p>
      </div>

      <button type="button" class="btn-queue" @click="router.push('/queue')">
        Browse Unassigned Queue
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
          All Assigned ({{ claimedTickets.length }})
        </button>
        <button
          type="button"
          class="tab-btn"
          :class="{ active: filter === 'active' }"
          @click="filter = 'active'"
        >
          Active
        </button>
        <button
          type="button"
          class="tab-btn"
          :class="{ active: filter === 'resolved' }"
          @click="filter = 'resolved'"
        >
          Resolved / Closed
        </button>
      </div>
    </div>

    <div v-if="isLoading" class="state-card">
      <div class="spinner"></div>
      <p class="state-text">Loading your claimed tickets...</p>
    </div>

    <div v-else-if="errorMessage" class="state-card error-card">
      <p class="error-text">{{ errorMessage }}</p>
      <button type="button" class="btn-primary" @click="fetchData">Retry</button>
    </div>

    <div v-else-if="filteredTickets.length === 0" class="empty-card">
      <p class="empty-title">No claimed tickets</p>
      <p class="empty-subtitle">
        {{
          filter === 'all'
            ? 'You have not claimed any tickets yet. Claim one from the ticket queue.'
            : 'No tickets match the selected status filter.'
        }}
      </p>
      <button
        v-if="filter === 'all'"
        type="button"
        class="btn-primary"
        @click="router.push('/queue')"
      >
        Go to Ticket Queue
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
          <div class="footer-meta">
            <span class="category-tag">{{ getCategoryName(ticket.CategoryID) }}</span>
            <span class="author-tag">By {{ getAuthorName(ticket.CreateBy) }}</span>
          </div>
          <span class="ticket-date">{{ formatDate(ticket.UpdatedAt) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.claimed-page {
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

.btn-queue {
  background: #f1f5f9;
  color: #0f172a;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  padding: 0.55rem 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-queue:hover {
  background: #e2e8f0;
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

.footer-meta {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.category-tag {
  font-size: 0.75rem;
  background: #f1f5f9;
  color: #475569;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
}

.author-tag {
  font-size: 0.75rem;
  color: #64748b;
}

.ticket-date {
  font-size: 0.75rem;
  color: #94a3b8;
}
</style>
