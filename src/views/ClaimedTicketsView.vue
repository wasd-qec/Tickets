<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useTicketsStore } from '@/stores/tickets'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import StatusBadge from '@/components/StatusBadge.vue'
import PriorityBadge from '@/components/PriorityBadge.vue'
import type { Ticket, TicketStatus } from '@/types'

const ticketsStore = useTicketsStore()
const auth = useAuthStore()
const router = useRouter()
const { showToast } = useToast()

const statusTabs: { label: string; value: TicketStatus | 'ALL' }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Open', value: 'OPEN' },
  { label: 'In Progress', value: 'IN_PROGRESS' },
  { label: 'Resolved', value: 'RESOLVED' },
  { label: 'Closed', value: 'CLOSED' },
  { label: 'Cancelled', value: 'CANCELLED' },
]

const selectedStatus = ref<TicketStatus | 'ALL'>('ALL')

async function loadClaimedTickets() {
  if (!auth.user) return
  try {
    await ticketsStore.fetchTickets({
      assignedToId: auth.user.id,
      limit: 100,
      status: selectedStatus.value === 'ALL' ? undefined : selectedStatus.value,
    })
  } catch (err: any) {
    showToast(err?.message || 'Failed to load claimed tickets', 'error')
  }
}

onMounted(() => {
  loadClaimedTickets()
})

function selectTab(status: TicketStatus | 'ALL') {
  selectedStatus.value = status
  loadClaimedTickets()
}

const claimedTickets = computed(() => {
  return ticketsStore.tickets.filter((t) => {
    const assigneeId = t.assignedToId ?? t.assignedTo?.id ?? t.assignedTechnician?.id
    if (auth.user && String(assigneeId) !== String(auth.user.id)) return false
    if (selectedStatus.value !== 'ALL' && t.status !== selectedStatus.value) return false
    return true
  })
})

function formatDate(iso: string) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function getCategoryName(ticket: Ticket) {
  return ticket.category?.name || ticket.categoryName || 'General'
}

function getAuthorName(ticket: Ticket) {
  return ticket.author?.username || ticket.createdBy?.username || ticket.authorUsername || 'Client'
}

function goToTicket(id: string | number) {
  router.push(`/tickets/${id}`)
}
</script>

<template>
  <div>
    <div class="page-header">
      <h2 class="page-title">My Claimed Tickets</h2>
      <RouterLink to="/queue" class="btn btn-secondary">Browse Ticket Queue</RouterLink>
    </div>

    <div class="tabs">
      <button
        v-for="tab in statusTabs"
        :key="tab.value"
        type="button"
        class="tab-btn"
        :class="{ active: selectedStatus === tab.value }"
        @click="selectTab(tab.value)"
      >
        {{ tab.label }}
      </button>
    </div>

    <div v-if="ticketsStore.loading" class="card">
      <div v-for="n in 4" :key="n" class="skeleton-row">
        <div class="skeleton skeleton-line"></div>
      </div>
    </div>

    <div v-else-if="claimedTickets.length === 0" class="card empty-state">
      <h3>No claimed tickets</h3>
      <p>Tickets you claim from the queue will appear here.</p>
      <RouterLink to="/queue" class="btn btn-primary">Go to Ticket Queue</RouterLink>
    </div>

    <div v-else class="card table-card">
      <div class="table-responsive">
        <table class="tickets-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Author</th>
              <th>Category</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Updated</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="ticket in claimedTickets"
              :key="ticket.id"
              class="clickable-row"
              @click="goToTicket(ticket.id)"
            >
              <td class="id-cell">#{{ ticket.id }}</td>
              <td class="title-cell">{{ ticket.title }}</td>
              <td>{{ getAuthorName(ticket) }}</td>
              <td>{{ getCategoryName(ticket) }}</td>
              <td><PriorityBadge :priority="ticket.priority" /></td>
              <td><StatusBadge :status="ticket.status" /></td>
              <td class="date-cell">{{ formatDate(ticket.updatedAt) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
.table-card {
  padding: 0;
  overflow: hidden;
}

.table-responsive {
  width: 100%;
  overflow-x: auto;
}

.tickets-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.tickets-table th {
  padding: 0.85rem 1.25rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: var(--text-muted);
  background: #f8fafc;
  border-bottom: 1px solid var(--border);
}

.tickets-table td {
  padding: 0.9rem 1.25rem;
  border-bottom: 1px solid var(--border);
  font-size: 0.875rem;
  vertical-align: middle;
}

.tickets-table tbody tr:last-child td {
  border-bottom: none;
}

.clickable-row {
  cursor: pointer;
  transition: background-color 0.12s;
}

.clickable-row:hover {
  background-color: #f8fafc;
}

.id-cell {
  color: var(--text-muted);
  font-weight: 600;
}

.title-cell {
  font-weight: 600;
  color: var(--text);
}

.date-cell {
  color: var(--text-muted);
  white-space: nowrap;
}

.skeleton-row {
  padding: 0.75rem 0;
}

.skeleton-line {
  height: 36px;
  width: 100%;
}
</style>

