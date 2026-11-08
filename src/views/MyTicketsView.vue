<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useTicketsStore } from '@/stores/tickets'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import StatusBadge from '@/components/StatusBadge.vue'
import PriorityBadge from '@/components/PriorityBadge.vue'
import ConfirmModal from '@/components/ConfirmModal.vue'
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
const cancelTarget = ref<Ticket | null>(null)
const cancelLoading = ref(false)

async function loadTickets() {
  try {
    await ticketsStore.fetchTickets({
      mine: true,
      limit: 100,
      status: selectedStatus.value === 'ALL' ? undefined : selectedStatus.value,
    })
  } catch (err: any) {
    showToast(err?.message || 'Failed to load tickets', 'error')
  }
}

onMounted(() => {
  loadTickets()
})

function selectTab(status: TicketStatus | 'ALL') {
  selectedStatus.value = status
  loadTickets()
}

const filteredTickets = computed(() => {
  return ticketsStore.tickets.filter((t) => {
    const ownerId = t.authorId ?? t.author?.id ?? t.createdBy?.id
    if (ownerId !== undefined && auth.user?.id !== undefined) {
      if (String(ownerId) !== String(auth.user.id)) return false
    }
    if (selectedStatus.value !== 'ALL' && t.status !== selectedStatus.value) {
      return false
    }
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

function goToTicket(id: string | number) {
  router.push(`/tickets/${id}`)
}

function openCancelModal(ticket: Ticket) {
  cancelTarget.value = ticket
}

async function confirmCancel() {
  if (!cancelTarget.value) return
  cancelLoading.value = true
  try {
    await ticketsStore.cancelTicket(cancelTarget.value.id)
    showToast('Ticket cancelled', 'success')
    cancelTarget.value = null
    await loadTickets()
  } catch (err: any) {
    showToast(err?.message || 'Failed to cancel ticket', 'error')
  } finally {
    cancelLoading.value = false
  }
}
</script>

<template>
  <div>
    <div class="page-header">
      <h2 class="page-title">My Tickets</h2>
      <RouterLink to="/tickets/new" class="btn btn-primary">+ New Ticket</RouterLink>
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
      <div v-for="n in 5" :key="n" class="skeleton-row">
        <div class="skeleton skeleton-line"></div>
      </div>
    </div>

    <div v-else-if="filteredTickets.length === 0" class="card empty-state">
      <h3>No tickets found</h3>
      <p>You don't have any tickets in this view yet.</p>
      <RouterLink to="/tickets/new" class="btn btn-primary">
        Create your first ticket
      </RouterLink>
    </div>

    <div v-else class="card table-card">
      <div class="table-responsive">
        <table class="tickets-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Category</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Created</th>
              <th class="actions-col">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="ticket in filteredTickets"
              :key="ticket.id"
              class="clickable-row"
              @click="goToTicket(ticket.id)"
            >
              <td class="title-cell">{{ ticket.title }}</td>
              <td>{{ getCategoryName(ticket) }}</td>
              <td><PriorityBadge :priority="ticket.priority" /></td>
              <td><StatusBadge :status="ticket.status" /></td>
              <td class="date-cell">{{ formatDate(ticket.createdAt) }}</td>
              <td class="actions-col" @click.stop>
                <button
                  v-if="ticket.status === 'OPEN'"
                  type="button"
                  class="btn btn-danger-outline btn-sm"
                  @click="openCancelModal(ticket)"
                >
                  Cancel
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <ConfirmModal
      :open="Boolean(cancelTarget)"
      title="Cancel Ticket"
      :message="`Are you sure you want to cancel &quot;${cancelTarget?.title ?? ''}&quot;? This action cannot be undone.`"
      confirm-label="Cancel Ticket"
      :danger="true"
      :loading="cancelLoading"
      @confirm="confirmCancel"
      @cancel="cancelTarget = null"
    />
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

.title-cell {
  font-weight: 600;
  color: var(--text);
}

.date-cell {
  color: var(--text-muted);
  white-space: nowrap;
}

.actions-col {
  text-align: right;
  width: 110px;
}

.skeleton-row {
  padding: 0.75rem 0;
}

.skeleton-line {
  height: 36px;
  width: 100%;
}
</style>

