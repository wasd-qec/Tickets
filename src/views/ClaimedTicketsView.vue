<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { mockTickets, mockCategories, mockUsers } from '@/Data/MockData'
import type { Stage } from '@/Data/Ticket'
import StatusBadge from '@/components/StatusBadge.vue'
import PriorityBadge from '@/components/PriorityBadge.vue'

const router = useRouter()
const auth = useAuthStore()

const selectedStage = ref<Stage | 'All'>('All')
const stages: (Stage | 'All')[] = ['All', 'Opened', 'In Progress', 'Resolved', 'Closed', 'Cancelled']

const claimedTickets = computed(() => {
  const currentUserId = auth.currentUser?.id
  return mockTickets.filter((t) => {
    if (t.Assignto !== currentUserId) return false
    if (selectedStage.value === 'All') return true
    return t.Stage === selectedStage.value
  })
})

function getCategoryName(categoryId: number) {
  const found = mockCategories.find((c) => c.CategroyID === categoryId)
  return found ? String(found.name) : 'General'
}

function getAuthorName(authorId: number) {
  const found = mockUsers.find((u) => u.id === authorId)
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
      <h1 class="page-title">My Claimed Tickets</h1>
      <RouterLink to="/queue" class="btn btn-secondary">Browse Queue</RouterLink>
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

    <div v-if="claimedTickets.length === 0" class="empty-card">
      <p class="empty-title">No claimed tickets</p>
      <p class="empty-subtitle">You have not claimed any tickets matching this status filter.</p>
      <RouterLink to="/queue" class="btn btn-primary">Go to Ticket Queue</RouterLink>
    </div>

    <div v-else class="table-card">
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
            :key="ticket.TicketID"
            class="ticket-row"
            @click="goToDetail(ticket.TicketID)"
          >
            <td class="ticket-id">#{{ ticket.TicketID }}</td>
            <td class="ticket-name">{{ ticket.Name }}</td>
            <td>{{ getAuthorName(ticket.CreateBy) }}</td>
            <td>{{ getCategoryName(ticket.CategoryID) }}</td>
            <td><PriorityBadge :priority="ticket.Priority" /></td>
            <td><StatusBadge :Stage="ticket.Stage" /></td>
            <td class="ticket-date">{{ formatDate(ticket.UpdatedAt) }}</td>
          </tr>
        </tbody>
      </table>
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
  cursor: pointer;
  display: inline-flex;
  align-items: center;
}

.btn-primary {
  background-color: #2563eb;
  color: #ffffff;
  border: 1px solid transparent;
}

.btn-secondary {
  background-color: #ffffff;
  color: #0f172a;
  border: 1px solid #e2e8f0;
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

.ticket-id {
  font-weight: 600;
  color: #64748b;
}

.ticket-name {
  font-weight: 600;
  color: #0f172a;
}

.ticket-date {
  color: #64748b;
  white-space: nowrap;
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
}
</style>
