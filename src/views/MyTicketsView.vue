<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import { mockTickets, mockCategories } from '@/Data/MockData'
import type { Tickets, Stage } from '@/Data/Ticket'
import StatusBadge from '@/components/StatusBadge.vue'
import PriorityBadge from '@/components/PriorityBadge.vue'
import ConfirmModal from '@/components/ConfirmModal.vue'

const router = useRouter()
const auth = useAuthStore()
const { showToast } = useToast()

const selectedStage = ref<Stage | 'All'>('All')
const stages: (Stage | 'All')[] = ['All', 'Opened', 'In Progress', 'Resolved', 'Closed', 'Cancelled']

const ticketToCancel = ref<Tickets | null>(null)
const showCancelModal = ref(false)

const clientTickets = computed(() => {
  const userId = auth.currentUser?.id
  return mockTickets.filter((t) => {
    const isOwner = t.CreateBy === userId
    if (!isOwner) return false
    if (selectedStage.value === 'All') return true
    return t.Stage === selectedStage.value
  })
})

function getCategoryName(categoryId: number) {
  const found = mockCategories.find((c) => c.CategroyID === categoryId)
  return found ? String(found.name) : 'General'
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function openCancelConfirm(ticket: Tickets) {
  ticketToCancel.value = ticket
  showCancelModal.value = true
}

function handleConfirmCancel() {
  if (ticketToCancel.value) {
    ticketToCancel.value.Stage = 'Cancelled'
    ticketToCancel.value.UpdatedAt = new Date().toISOString()
    showToast(`Ticket #${ticketToCancel.value.TicketID} cancelled`, 'success')
  }
  showCancelModal.value = false
  ticketToCancel.value = null
}

function goToDetail(id: number) {
  router.push(`/tickets/${id}`)
}
</script>

<template>
  <div class="tickets-page">
    <div class="page-header">
      <h1 class="page-title">My Tickets</h1>
      <RouterLink to="/tickets/new" class="btn btn-primary">+ New Ticket</RouterLink>
    </div>

    <div class="tabs">
      <button
        v-for="stage in stages"
        :key="stage"
        type="button"
        class="tab-btn"
        :class="{ active: selectedStage === stage }"
        @click="selectedStage = stage"
      >
        {{ stage }}
      </button>
    </div>

    <div v-if="clientTickets.length === 0" class="empty-card">
      <p class="empty-title">No tickets found</p>
      <p class="empty-subtitle">You have no tickets under this status filter.</p>
      <RouterLink to="/tickets/new" class="btn btn-primary">Create your first ticket</RouterLink>
    </div>

    <div v-else class="table-card">
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
            v-for="ticket in clientTickets"
            :key="ticket.TicketID"
            class="ticket-row"
            @click="goToDetail(ticket.TicketID)"
          >
            <td class="ticket-name">{{ ticket.Name }}</td>
            <td>{{ getCategoryName(ticket.CategoryID) }}</td>
            <td><PriorityBadge :priority="ticket.Priority" /></td>
            <td><StatusBadge :Stage="ticket.Stage" /></td>
            <td class="ticket-date">{{ formatDate(ticket.CreateAt) }}</td>
            <td class="actions-col" @click.stop>
              <button
                v-if="ticket.Stage === 'Opened'"
                type="button"
                class="btn-cancel"
                @click="openCancelConfirm(ticket)"
              >
                Cancel
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <ConfirmModal
      :open="showCancelModal"
      title="Cancel Ticket"
      :message="`Are you sure you want to cancel &quot;${ticketToCancel?.Name}&quot;? This action cannot be undone.`"
      confirm-label="Cancel Ticket"
      :danger="true"
      @confirm="handleConfirmCancel"
      @cancel="showCancelModal = false"
    />
  </div>
</template>

<style scoped>
.tickets-page {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #0f172a;
}

.btn {
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  text-decoration: none;
  border: 1px solid transparent;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
}

.btn-primary {
  background-color: #2563eb;
  color: #ffffff;
}

.btn-primary:hover {
  background-color: #1d4ed8;
}

.tabs {
  display: flex;
  gap: 0.5rem;
  border-bottom: 1px solid #e2e8f0;
  overflow-x: auto;
}

.tab-btn {
  background: transparent;
  border: none;
  padding: 0.5rem 0.85rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #64748b;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  white-space: nowrap;
}

.tab-btn.active {
  color: #2563eb;
  font-weight: 600;
  border-bottom-color: #2563eb;
}

.table-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow-x: auto;
}

.tickets-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 0.875rem;
}

.tickets-table th {
  background-color: #f8fafc;
  padding: 0.75rem 1rem;
  color: #64748b;
  font-weight: 600;
  border-bottom: 1px solid #e2e8f0;
}

.tickets-table td {
  padding: 0.85rem 1rem;
  border-bottom: 1px solid #e2e8f0;
  color: #0f172a;
}

.ticket-row {
  cursor: pointer;
  transition: background-color 0.15s;
}

.ticket-row:hover {
  background-color: #f8fafc;
}

.ticket-name {
  font-weight: 600;
  color: #0f172a;
}

.ticket-date {
  color: #64748b;
  white-space: nowrap;
}

.actions-col {
  text-align: right;
  width: 100px;
}

.btn-cancel {
  background: transparent;
  border: 1px solid #fecaca;
  color: #dc2626;
  border-radius: 6px;
  padding: 0.25rem 0.6rem;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
}

.btn-cancel:hover {
  background-color: #fee2e2;
}

.empty-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 3rem 1.5rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.empty-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #0f172a;
}

.empty-subtitle {
  color: #64748b;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}
</style>
