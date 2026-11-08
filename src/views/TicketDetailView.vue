<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useTicketsStore } from '@/stores/tickets'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import StatusBadge from '@/components/StatusBadge.vue'
import PriorityBadge from '@/components/PriorityBadge.vue'
import RoleBadge from '@/components/RoleBadge.vue'
import ConfirmModal from '@/components/ConfirmModal.vue'
import type { Comment, TicketPriority, TicketStatus } from '@/types'

const route = useRoute()
const ticketsStore = useTicketsStore()
const auth = useAuthStore()
const { showToast } = useToast()

const forbidden = ref(false)
const actionLoading = ref(false)
const newComment = ref('')
const commentSubmitting = ref(false)

const confirmCancelOpen = ref(false)
const confirmCloseOpen = ref(false)
const commentToDelete = ref<Comment | null>(null)

const ticketId = computed(() => route.params.id as string)
const ticket = computed(() => ticketsStore.currentTicket)

const backPath = computed(() => (auth.user?.role === 'CLIENT' ? '/tickets' : '/queue'))
const backLabel = computed(() =>
  auth.user?.role === 'CLIENT' ? '← Back to My Tickets' : '← Back to Ticket Queue',
)

const isStaff = computed(
  () => auth.user?.role === 'TECHNICIAN' || auth.user?.role === 'ADMIN',
)
const isAdmin = computed(() => auth.user?.role === 'ADMIN')
const isClient = computed(() => auth.user?.role === 'CLIENT')

const isOwnTicket = computed(() => {
  if (!ticket.value || !auth.user) return false
  const authorId = ticket.value.authorId ?? ticket.value.author?.id ?? ticket.value.createdBy?.id
  if (authorId !== undefined) {
    return String(authorId) === String(auth.user.id)
  }
  const authorName =
    ticket.value.author?.username ||
    ticket.value.createdBy?.username ||
    ticket.value.authorUsername
  return authorName ? authorName === auth.user.username : true
})

const isArchived = computed(
  () => ticket.value?.status === 'CLOSED' || ticket.value?.status === 'CANCELLED',
)

const assignedName = computed(() => {
  if (!ticket.value) return null
  return (
    ticket.value.assignedTo?.username ||
    ticket.value.assignedTechnician?.username ||
    (ticket.value.assignedToId ? `User #${ticket.value.assignedToId}` : null)
  )
})

const isUnassigned = computed(() => {
  if (!ticket.value) return false
  return !ticket.value.assignedToId && !ticket.value.assignedTo && !ticket.value.assignedTechnician
})

async function loadData() {
  forbidden.value = false
  try {
    const res = await ticketsStore.fetchTicketDetail(ticketId.value)
    if (isClient.value && res.ticket) {
      const ownerId =
        res.ticket.authorId ?? res.ticket.author?.id ?? res.ticket.createdBy?.id
      if (ownerId !== undefined && auth.user?.id !== undefined) {
        if (String(ownerId) !== String(auth.user.id)) {
          forbidden.value = true
        }
      }
    }
  } catch (err: any) {
    if (err?.status === 403) {
      forbidden.value = true
    } else {
      showToast(err?.message || 'Failed to load ticket', 'error')
    }
  }
}

onMounted(() => {
  loadData()
})

async function refreshAll() {
  await ticketsStore.refreshTicketAndTimeline(ticketId.value)
}

async function handleClaimTicket() {
  if (!ticket.value || !auth.user) return
  actionLoading.value = true
  try {
    await ticketsStore.updateTicket(ticket.value.id, {
      assignedToId: auth.user.id,
    })
    await refreshAll()
    showToast('Ticket claimed', 'success')
  } catch (err: any) {
    showToast(err?.message || 'Failed to claim ticket', 'error')
  } finally {
    actionLoading.value = false
  }
}

async function handlePriorityChange(event: Event) {
  if (!ticket.value) return
  const target = event.target as HTMLSelectElement
  const priority = target.value as TicketPriority
  actionLoading.value = true
  try {
    await ticketsStore.updateTicket(ticket.value.id, { priority })
    await refreshAll()
    showToast(`Priority updated to ${priority}`, 'success')
  } catch (err: any) {
    showToast(err?.message || 'Failed to update priority', 'error')
    await refreshAll()
  } finally {
    actionLoading.value = false
  }
}

async function handleStatusChange(event: Event) {
  if (!ticket.value) return
  const target = event.target as HTMLSelectElement
  const status = target.value as TicketStatus
  actionLoading.value = true
  try {
    await ticketsStore.updateTicket(ticket.value.id, { status })
    await refreshAll()
    showToast(`Status updated to ${status}`, 'success')
  } catch (err: any) {
    showToast(err?.message || 'Failed to update status', 'error')
    await refreshAll()
  } finally {
    actionLoading.value = false
  }
}

async function handleConfirmCancel() {
  if (!ticket.value) return
  actionLoading.value = true
  try {
    await ticketsStore.cancelTicket(ticket.value.id)
    confirmCancelOpen.value = false
    await refreshAll()
    showToast('Ticket cancelled', 'success')
  } catch (err: any) {
    showToast(err?.message || 'Failed to cancel ticket', 'error')
  } finally {
    actionLoading.value = false
  }
}

async function handleConfirmClose() {
  if (!ticket.value) return
  actionLoading.value = true
  try {
    await ticketsStore.closeTicket(ticket.value.id)
    confirmCloseOpen.value = false
    await refreshAll()
    showToast('Ticket closed', 'success')
  } catch (err: any) {
    showToast(err?.message || 'Failed to close ticket', 'error')
  } finally {
    actionLoading.value = false
  }
}

async function handlePostComment() {
  if (!ticket.value || !newComment.value.trim()) return
  commentSubmitting.value = true
  try {
    await ticketsStore.addComment(ticket.value.id, newComment.value.trim())
    newComment.value = ''
    await refreshAll()
    showToast('Comment posted', 'success')
  } catch (err: any) {
    showToast(err?.message || 'Failed to post comment', 'error')
  } finally {
    commentSubmitting.value = false
  }
}

async function handleConfirmDeleteComment() {
  if (!commentToDelete.value) return
  actionLoading.value = true
  try {
    await ticketsStore.deleteComment(commentToDelete.value.id)
    commentToDelete.value = null
    await refreshAll()
    showToast('Comment deleted', 'success')
  } catch (err: any) {
    showToast(err?.message || 'Failed to delete comment', 'error')
  } finally {
    actionLoading.value = false
  }
}

function getCommentText(c: Comment): string {
  return c.content || c.text || c.body || ''
}

function getCommentAuthor(c: Comment): string {
  return c.author?.username || c.user?.username || 'User'
}

function getCommentRole(c: Comment) {
  return c.author?.role || c.user?.role || 'CLIENT'
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

function formatDateTime(iso?: string): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleString()
}
</script>

<template>
  <div>
    <div class="back-row">
      <RouterLink :to="backPath" class="back-link">{{ backLabel }}</RouterLink>
    </div>

    <div v-if="forbidden" class="card forbidden-card">
      <h2>403 — Access Denied</h2>
      <p>You do not have permission to view another client's ticket.</p>
      <RouterLink :to="backPath" class="btn btn-primary">Return to My Tickets</RouterLink>
    </div>

    <div v-else-if="ticketsStore.detailLoading" class="card">
      <div class="skeleton skeleton-title"></div>
      <div class="skeleton skeleton-body"></div>
    </div>

    <div v-else-if="ticket" class="detail-grid" :class="{ 'with-sidebar': isStaff }">
      <div class="detail-main">
        <div class="card ticket-header-card">
          <div class="ticket-top-row">
            <div class="ticket-title-group">
              <span class="ticket-id">#{{ ticket.id }}</span>
              <h2 class="ticket-title">{{ ticket.title }}</h2>
            </div>
            <div class="ticket-badges">
              <StatusBadge :status="ticket.status" />
              <PriorityBadge :priority="ticket.priority" />
            </div>
          </div>

          <div class="metadata-grid">
            <div class="meta-item">
              <span class="meta-label">Category</span>
              <span class="meta-value">{{ ticket.category?.name || ticket.categoryName || 'General' }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Author</span>
              <span class="meta-value">
                {{ ticket.author?.username || ticket.createdBy?.username || ticket.authorUsername || 'Client' }}
              </span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Assigned Technician</span>
              <span class="meta-value">{{ assignedName || 'Unassigned' }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Created</span>
              <span class="meta-value">{{ formatDateTime(ticket.createdAt) }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Updated</span>
              <span class="meta-value">{{ formatDateTime(ticket.updatedAt) }}</span>
            </div>
          </div>

          <div class="ticket-description">
            <h4 class="section-subtitle">Description</h4>
            <p class="description-text">{{ ticket.description }}</p>
          </div>

          <div v-if="isClient && isOwnTicket" class="client-actions">
            <button
              v-if="ticket.status === 'OPEN'"
              type="button"
              class="btn btn-danger-outline"
              :disabled="actionLoading"
              @click="confirmCancelOpen = true"
            >
              Cancel Ticket
            </button>
            <button
              v-if="ticket.status === 'RESOLVED'"
              type="button"
              class="btn btn-primary"
              :disabled="actionLoading"
              @click="confirmCloseOpen = true"
            >
              Close Ticket
            </button>
          </div>
        </div>

        <div class="card timeline-card">
          <h3 class="timeline-heading">Discussion Timeline</h3>

          <div v-if="ticketsStore.comments.length === 0" class="timeline-empty">
            No comments or activity yet.
          </div>

          <div v-else class="timeline-list">
            <template v-for="item in ticketsStore.comments" :key="item.id">
              <div v-if="item.isSystem" class="system-event">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 8v4l2.5 2.5" stroke-linecap="round" />
                </svg>
                <span>{{ getCommentText(item) }}</span>
                <span class="system-time">&middot; {{ formatDateTime(item.createdAt) }}</span>
              </div>

              <div v-else class="comment-item">
                <div class="avatar">{{ getInitials(getCommentAuthor(item)) }}</div>
                <div class="comment-body">
                  <div class="comment-header">
                    <div class="comment-author-meta">
                      <span class="comment-author">{{ getCommentAuthor(item) }}</span>
                      <RoleBadge :role="getCommentRole(item)" />
                      <span class="comment-time">{{ formatDateTime(item.createdAt) }}</span>
                    </div>
                    <button
                      v-if="isAdmin"
                      type="button"
                      class="btn-icon"
                      title="Delete comment"
                      :disabled="actionLoading"
                      @click="commentToDelete = item"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z" stroke-linecap="round" stroke-linejoin="round" />
                      </svg>
                    </button>
                  </div>
                  <p class="comment-text">{{ getCommentText(item) }}</p>
                </div>
              </div>
            </template>
          </div>

          <div v-if="isArchived" class="locked-banner">
            This ticket is archived and locked.
          </div>

          <form v-else class="comment-form" @submit.prevent="handlePostComment">
            <textarea
              v-model="newComment"
              class="form-textarea"
              placeholder="Write a comment..."
              required
            ></textarea>
            <div class="comment-form-actions">
              <button
                type="submit"
                class="btn btn-primary"
                :disabled="commentSubmitting || !newComment.trim()"
              >
                {{ commentSubmitting ? 'Posting...' : 'Post comment' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <aside v-if="isStaff" class="staff-panel card">
        <h3 class="panel-title">Staff Actions</h3>

        <button
          v-if="isUnassigned"
          type="button"
          class="btn btn-primary full-btn"
          :disabled="actionLoading"
          @click="handleClaimTicket"
        >
          Claim Ticket
        </button>

        <div class="form-group">
          <label for="staff-priority" class="form-label">Priority</label>
          <select
            id="staff-priority"
            class="form-select"
            :value="ticket.priority"
            :disabled="actionLoading"
            @change="handlePriorityChange"
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
        </div>

        <div class="form-group">
          <label for="staff-status" class="form-label">Status</label>
          <select
            id="staff-status"
            class="form-select"
            :value="['OPEN', 'IN_PROGRESS', 'RESOLVED'].includes(ticket.status) ? ticket.status : 'RESOLVED'"
            :disabled="actionLoading || isArchived"
            @change="handleStatusChange"
          >
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
          </select>
        </div>

        <button
          v-if="ticket.status === 'RESOLVED'"
          type="button"
          class="btn btn-secondary full-btn"
          :disabled="actionLoading"
          @click="confirmCloseOpen = true"
        >
          Close Ticket
        </button>
      </aside>
    </div>

    <ConfirmModal
      :open="confirmCancelOpen"
      title="Cancel Ticket"
      message="Are you sure you want to cancel this ticket?"
      confirm-label="Cancel Ticket"
      :danger="true"
      :loading="actionLoading"
      @confirm="handleConfirmCancel"
      @cancel="confirmCancelOpen = false"
    />

    <ConfirmModal
      :open="confirmCloseOpen"
      title="Close Ticket"
      message="Confirm closing this resolved ticket? Once closed, it will be archived and locked."
      confirm-label="Close Ticket"
      :loading="actionLoading"
      @confirm="handleConfirmClose"
      @cancel="confirmCloseOpen = false"
    />

    <ConfirmModal
      :open="Boolean(commentToDelete)"
      title="Delete Comment"
      message="Are you sure you want to permanently delete this comment?"
      confirm-label="Delete"
      :danger="true"
      :loading="actionLoading"
      @confirm="handleConfirmDeleteComment"
      @cancel="commentToDelete = null"
    />
  </div>
</template>

<style scoped>
.back-row {
  margin-bottom: 1rem;
}

.back-link {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-muted);
}

.back-link:hover {
  color: var(--primary);
}

.forbidden-card {
  text-align: center;
  padding: 3rem 1.5rem;
}

.forbidden-card h2 {
  color: var(--danger);
  margin-bottom: 0.5rem;
}

.forbidden-card p {
  color: var(--text-muted);
  margin-bottom: 1.25rem;
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.25rem;
  align-items: start;
}

.detail-grid.with-sidebar {
  grid-template-columns: 1fr 290px;
}

.detail-main {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  min-width: 0;
}

.ticket-top-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
}

.ticket-title-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.ticket-id {
  font-size: 0.825rem;
  font-weight: 600;
  color: var(--text-muted);
}

.ticket-title {
  font-size: 1.35rem;
  font-weight: 700;
  color: var(--text);
}

.ticket-badges {
  display: flex;
  gap: 0.5rem;
}

.metadata-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 1rem;
  padding: 1rem;
  background: #f8fafc;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  margin-bottom: 1.25rem;
}

.meta-item {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.meta-label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--text-muted);
}

.meta-value {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text);
}

.section-subtitle {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  margin-bottom: 0.4rem;
}

.description-text {
  font-size: 0.9375rem;
  white-space: pre-wrap;
  color: var(--text);
}

.client-actions {
  margin-top: 1.25rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border);
  display: flex;
  gap: 0.75rem;
}

.timeline-heading {
  font-size: 1.05rem;
  font-weight: 600;
  margin-bottom: 1.25rem;
}

.timeline-empty {
  color: var(--text-muted);
  font-size: 0.875rem;
  padding: 1rem 0;
}

.timeline-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.system-event {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  color: var(--text-muted);
  font-size: 0.8125rem;
  text-align: center;
  padding: 0.35rem 0.75rem;
}

.system-time {
  font-size: 0.75rem;
}

.comment-item {
  display: flex;
  gap: 0.75rem;
  padding: 0.9rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: #ffffff;
}

.comment-body {
  flex: 1;
  min-width: 0;
}

.comment-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.4rem;
}

.comment-author-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.comment-author {
  font-weight: 600;
  font-size: 0.875rem;
}

.comment-time {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.comment-text {
  font-size: 0.9rem;
  white-space: pre-wrap;
}

.locked-banner {
  padding: 0.85rem 1rem;
  border-radius: var(--radius-sm);
  background: #f1f5f9;
  border: 1px solid var(--border);
  color: var(--text-muted);
  font-size: 0.875rem;
  font-weight: 500;
  text-align: center;
}

.comment-form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.comment-form-actions {
  display: flex;
  justify-content: flex-end;
}

.staff-panel {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.panel-title {
  font-size: 1rem;
  font-weight: 600;
}

.full-btn {
  width: 100%;
}

.skeleton-title {
  height: 32px;
  width: 60%;
  margin-bottom: 1rem;
}

.skeleton-body {
  height: 140px;
  width: 100%;
}

@media (max-width: 900px) {
  .detail-grid.with-sidebar {
    grid-template-columns: 1fr;
  }
}
</style>

