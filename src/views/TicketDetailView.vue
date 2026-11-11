<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import { mockTickets, mockCategories, mockComments, mockUsers } from '@/Data/MockData'
import type { Priority, Stage } from '@/Data/Ticket'
import type { Comment } from '@/Data/Comment'
import StatusBadge from '@/components/StatusBadge.vue'
import PriorityBadge from '@/components/PriorityBadge.vue'
import RoleBadge from '@/components/RoleBadge.vue'
import ConfirmModal from '@/components/ConfirmModal.vue'

const route = useRoute()
const auth = useAuthStore()
const { showToast } = useToast()

const ticketId = computed(() => Number(route.params.id))
const ticket = computed(() => mockTickets.find((t) => t.TicketID === ticketId.value))

const backPath = computed(() => (auth.currentUser?.role === 'CLIENT' ? '/tickets' : '/queue'))
const backLabel = computed(() =>
  auth.currentUser?.role === 'CLIENT' ? '← Back to My Tickets' : '← Back to Queue',
)

const isStaff = computed(
  () => auth.currentUser?.role === 'TECHNICIAN' || auth.currentUser?.role === 'ADMIN',
)
const isAdmin = computed(() => auth.currentUser?.role === 'ADMIN')
const isTechnician = computed(() => auth.currentUser?.role === 'TECHNICIAN')
const isClient = computed(() => auth.currentUser?.role === 'CLIENT')

const isOwner = computed(() => ticket.value?.CreateBy === auth.currentUser?.id)
const isAssignedToCurrent = computed(() => ticket.value?.Assignto === auth.currentUser?.id)

const isForbiddenClient = computed(() => isClient.value && Boolean(ticket.value) && !isOwner.value)

const canTechnicianComment = computed(() => {
  if (!isTechnician.value) return true
  return isAssignedToCurrent.value
})

const canModifyStaffControls = computed(() => {
  if (isAdmin.value) return true
  if (isTechnician.value) {
    return !ticket.value?.Assignto || isAssignedToCurrent.value
  }
  return false
})

const isArchived = computed(
  () => ticket.value?.Stage === 'Closed' || ticket.value?.Stage === 'Cancelled',
)

const ticketComments = computed(() =>
  mockComments.filter((c) => c.TicketID === ticketId.value),
)

const newCommentText = ref('')
const showCancelModal = ref(false)
const showCloseModal = ref(false)
const commentToDelete = ref<Comment | null>(null)

function getCategoryName(categoryId: number) {
  const found = mockCategories.find((c) => c.CategroyID === categoryId)
  return found ? String(found.name) : 'General'
}

function getUser(userId: number) {
  return mockUsers.find((u) => u.id === userId)
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString()
}

function getInitials(name: string) {
  return name.slice(0, 2).toUpperCase()
}

function handleClaim() {
  if (!ticket.value || !auth.currentUser) return
  ticket.value.Assignto = auth.currentUser.id
  ticket.value.UpdatedAt = new Date().toISOString()

  mockComments.push({
    CommentID: Date.now(),
    TicketID: ticket.value.TicketID,
    AuthorID: auth.currentUser.id,
    SystemMessage: true,
    Message: `Ticket claimed by ${auth.currentUser.username}`,
    creatAt: new Date().toISOString(),
  })

  showToast('Ticket claimed successfully', 'success')
}

function handleReassign(event: Event) {
  if (!ticket.value) return
  const target = event.target as HTMLSelectElement
  const newAssigneeId = target.value ? Number(target.value) : undefined
  ticket.value.Assignto = newAssigneeId
  ticket.value.UpdatedAt = new Date().toISOString()

  const assigneeUser = newAssigneeId ? getUser(newAssigneeId) : null
  mockComments.push({
    CommentID: Date.now(),
    TicketID: ticket.value.TicketID,
    AuthorID: auth.currentUser?.id || 1,
    SystemMessage: true,
    Message: assigneeUser
      ? `Ticket assigned to ${assigneeUser.username}`
      : 'Ticket unassigned',
    creatAt: new Date().toISOString(),
  })

  showToast(assigneeUser ? 'Ticket reassigned' : 'Ticket unassigned', 'success')
}

function handleCategoryChange(event: Event) {
  if (!ticket.value) return
  const target = event.target as HTMLSelectElement
  const newCatId = Number(target.value)
  ticket.value.CategoryID = newCatId
  ticket.value.UpdatedAt = new Date().toISOString()

  const catName = getCategoryName(newCatId)
  mockComments.push({
    CommentID: Date.now(),
    TicketID: ticket.value.TicketID,
    AuthorID: auth.currentUser?.id || 1,
    SystemMessage: true,
    Message: `Category changed to ${catName}`,
    creatAt: new Date().toISOString(),
  })

  showToast('Category updated', 'success')
}

function handlePriorityChange(event: Event) {
  if (!ticket.value) return
  const target = event.target as HTMLSelectElement
  const newPriority = target.value as Priority
  ticket.value.Priority = newPriority
  ticket.value.UpdatedAt = new Date().toISOString()
  showToast(`Priority updated to ${newPriority}`, 'success')
}

function handleStatusChange(event: Event) {
  if (!ticket.value) return
  const target = event.target as HTMLSelectElement
  const newStage = target.value as Stage
  const prevStage = ticket.value.Stage
  ticket.value.Stage = newStage
  ticket.value.UpdatedAt = new Date().toISOString()

  mockComments.push({
    CommentID: Date.now(),
    TicketID: ticket.value.TicketID,
    AuthorID: auth.currentUser?.id || 1,
    SystemMessage: true,
    Message: `Status changed from ${prevStage} to ${newStage}`,
    creatAt: new Date().toISOString(),
  })

  showToast(`Status updated to ${newStage}`, 'success')
}

function handleConfirmCancel() {
  if (!ticket.value) return
  ticket.value.Stage = 'Cancelled'
  ticket.value.UpdatedAt = new Date().toISOString()
  showToast('Ticket cancelled', 'success')
  showCancelModal.value = false
}

function handleConfirmClose() {
  if (!ticket.value) return
  ticket.value.Stage = 'Closed'
  ticket.value.UpdatedAt = new Date().toISOString()
  showToast('Ticket closed and archived', 'success')
  showCloseModal.value = false
}

function handlePostComment() {
  if (!ticket.value || !newCommentText.value.trim() || !auth.currentUser) return
  mockComments.push({
    CommentID: Date.now(),
    TicketID: ticket.value.TicketID,
    AuthorID: auth.currentUser.id,
    SystemMessage: false,
    Message: newCommentText.value.trim(),
    creatAt: new Date().toISOString(),
  })
  newCommentText.value = ''
  showToast('Comment posted', 'success')
}

function handleDeleteComment() {
  if (!commentToDelete.value) return
  const idx = mockComments.findIndex((c) => c.CommentID === commentToDelete.value?.CommentID)
  if (idx !== -1) {
    mockComments.splice(idx, 1)
    showToast('Comment deleted', 'success')
  }
  commentToDelete.value = null
}
</script>

<template>
  <div v-if="isForbiddenClient" class="empty-card forbidden-card">
    <h2>403 — Access Denied</h2>
    <p>You do not have permission to view another client's ticket.</p>
    <RouterLink :to="backPath" class="btn btn-primary">Return to My Tickets</RouterLink>
  </div>

  <div v-else-if="!ticket" class="empty-card">
    <h2>Ticket not found</h2>
    <p>The ticket you requested does not exist.</p>
    <RouterLink :to="backPath" class="btn btn-primary">Return</RouterLink>
  </div>

  <div v-else class="detail-page">
    <div class="back-row">
      <RouterLink :to="backPath" class="back-link">{{ backLabel }}</RouterLink>
    </div>

    <div class="detail-layout" :class="{ 'has-sidebar': isStaff }">
      <div class="detail-main">
        <div class="card header-card">
          <div class="header-top">
            <div>
              <span class="ticket-id">#{{ ticket.TicketID }}</span>
              <h1 class="ticket-title">{{ ticket.Name }}</h1>
            </div>
            <div class="badges">
              <StatusBadge :Stage="ticket.Stage" />
              <PriorityBadge :priority="ticket.Priority" />
            </div>
          </div>

          <div class="metadata-grid">
            <div class="meta-item">
              <span class="meta-label">Category</span>
              <span class="meta-val">{{ getCategoryName(ticket.CategoryID) }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Author</span>
              <span class="meta-val">
                {{ getUser(ticket.CreateBy)?.username || `User #${ticket.CreateBy}` }}
              </span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Assigned Technician</span>
              <span class="meta-val">
                {{
                  ticket.Assignto
                    ? getUser(ticket.Assignto)?.username || `User #${ticket.Assignto}`
                    : 'Unassigned'
                }}
              </span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Created</span>
              <span class="meta-val">{{ formatDate(ticket.CreateAt) }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Updated</span>
              <span class="meta-val">{{ formatDate(ticket.UpdatedAt) }}</span>
            </div>
          </div>

          <div v-if="ticket.Description" class="ticket-description">
            <span class="meta-label">Description</span>
            <p class="description-body">{{ ticket.Description }}</p>
          </div>

          <div v-if="isClient && isOwner" class="client-actions">
            <button
              v-if="ticket.Stage === 'Opened'"
              type="button"
              class="btn btn-danger-outline"
              @click="showCancelModal = true"
            >
              Cancel Ticket
            </button>
            <button
              v-if="ticket.Stage === 'Resolved'"
              type="button"
              class="btn btn-primary"
              @click="showCloseModal = true"
            >
              Close Ticket
            </button>
          </div>
        </div>

        <div class="card timeline-card">
          <h2 class="timeline-title">Discussion Timeline</h2>

          <div v-if="ticketComments.length === 0" class="no-comments">
            No activity or comments recorded yet.
          </div>

          <div v-else class="comments-list">
            <template v-for="c in ticketComments" :key="c.CommentID">
              <div v-if="c.SystemMessage" class="system-event">
                <span class="system-icon">&bull;</span>
                <span class="system-text">{{ c.Message }}</span>
                <span class="system-time">&middot; {{ formatDate(c.creatAt) }}</span>
              </div>

              <div v-else class="comment-item">
                <div class="comment-avatar">
                  {{ getInitials(getUser(c.AuthorID)?.username || 'User') }}
                </div>
                <div class="comment-content">
                  <div class="comment-head">
                    <div class="author-meta">
                      <span class="author-name">{{ getUser(c.AuthorID)?.username || 'User' }}</span>
                      <RoleBadge v-if="getUser(c.AuthorID)" :role="getUser(c.AuthorID)!.role" />
                      <span class="comment-time">{{ formatDate(c.creatAt) }}</span>
                    </div>
                    <button
                      v-if="isAdmin"
                      type="button"
                      class="btn-delete"
                      title="Delete comment"
                      @click="commentToDelete = c"
                    >
                      &times;
                    </button>
                  </div>
                  <p class="comment-body">{{ c.Message }}</p>
                </div>
              </div>
            </template>
          </div>

          <div v-if="isArchived" class="locked-banner">
            This ticket is archived and locked.
          </div>

          <div v-else-if="!canTechnicianComment" class="locked-banner">
            <template v-if="!ticket.Assignto">
              Claim this ticket to post comments and work on it.
            </template>
            <template v-else>
              This ticket is assigned to
              {{ getUser(ticket.Assignto)?.username || 'another technician' }}. Other technicians
              have view-only access.
            </template>
          </div>

          <form v-else class="comment-form" @submit.prevent="handlePostComment">
            <textarea
              v-model="newCommentText"
              rows="3"
              placeholder="Write a comment..."
              required
            ></textarea>
            <div class="form-bottom">
              <button type="submit" class="btn btn-primary" :disabled="!newCommentText.trim()">
                Post comment
              </button>
            </div>
          </form>
        </div>
      </div>

      <aside v-if="isStaff" class="card staff-sidebar">
        <h2 class="staff-title">Staff Actions</h2>

        <button
          v-if="!ticket.Assignto"
          type="button"
          class="btn btn-primary full-btn"
          @click="handleClaim"
        >
          Claim Ticket
        </button>

        <div v-if="isAdmin" class="form-group">
          <label>Assignee</label>
          <select :value="ticket.Assignto || ''" class="form-select" @change="handleReassign">
            <option value="">Unassigned</option>
            <option
              v-for="u in mockUsers.filter((usr) => usr.role === 'TECHNICIAN' || usr.role === 'ADMIN')"
              :key="u.id"
              :value="u.id"
            >
              {{ u.username }} ({{ u.role }})
            </option>
          </select>
        </div>

        <div class="form-group">
          <label>Category</label>
          <select
            :value="ticket.CategoryID"
            class="form-select"
            :disabled="!canModifyStaffControls"
            @change="handleCategoryChange"
          >
            <option v-for="cat in mockCategories" :key="cat.CategroyID" :value="cat.CategroyID">
              {{ cat.name }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label>Priority</label>
          <select
            :value="ticket.Priority"
            class="form-select"
            :disabled="!canModifyStaffControls"
            @change="handlePriorityChange"
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>

        <div class="form-group">
          <label>Status</label>
          <select
            :value="['Opened', 'In Progress', 'Resolved'].includes(ticket.Stage) ? ticket.Stage : 'Resolved'"
            class="form-select"
            :disabled="isArchived || !canModifyStaffControls"
            @change="handleStatusChange"
          >
            <option value="Opened">Opened</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>

        <button
          v-if="ticket.Stage === 'Resolved' && canModifyStaffControls"
          type="button"
          class="btn btn-secondary full-btn"
          @click="showCloseModal = true"
        >
          Close Ticket
        </button>
      </aside>
    </div>

    <ConfirmModal
      :open="showCancelModal"
      title="Cancel Ticket"
      message="Are you sure you want to cancel this ticket?"
      confirm-label="Cancel Ticket"
      :danger="true"
      @confirm="handleConfirmCancel"
      @cancel="showCancelModal = false"
    />

    <ConfirmModal
      :open="showCloseModal"
      title="Close Ticket"
      message="Confirm closing this resolved ticket? Once closed, it will be archived and locked."
      confirm-label="Close Ticket"
      @confirm="handleConfirmClose"
      @cancel="showCloseModal = false"
    />

    <ConfirmModal
      :open="Boolean(commentToDelete)"
      title="Delete Comment"
      message="Are you sure you want to delete this comment?"
      confirm-label="Delete"
      :danger="true"
      @confirm="handleDeleteComment"
      @cancel="commentToDelete = null"
    />
  </div>
</template>

<style scoped>
.detail-page {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.back-link {
  color: #64748b;
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
}

.back-link:hover {
  color: #2563eb;
}

.detail-layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.25rem;
  align-items: start;
}

.detail-layout.has-sidebar {
  grid-template-columns: 1fr 280px;
}

.detail-main {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.5rem;
}

.header-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
}

.ticket-id {
  font-size: 0.875rem;
  font-weight: 600;
  color: #64748b;
}

.ticket-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #0f172a;
}

.badges {
  display: flex;
  gap: 0.5rem;
}

.metadata-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  padding: 1rem;
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}

.meta-item {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.meta-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
}

.meta-val {
  font-size: 0.875rem;
  font-weight: 500;
  color: #0f172a;
}

.ticket-description {
  margin-top: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.description-body {
  font-size: 0.9rem;
  color: #0f172a;
  white-space: pre-wrap;
}

.client-actions {
  margin-top: 1.25rem;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
  display: flex;
  gap: 0.75rem;
}

.timeline-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.no-comments {
  color: #64748b;
  font-size: 0.875rem;
  padding: 1rem 0;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.system-event {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  font-size: 0.8125rem;
  color: #64748b;
  padding: 0.4rem;
  background-color: #f8fafc;
  border-radius: 6px;
}

.comment-item {
  display: flex;
  gap: 0.75rem;
  padding: 0.85rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}

.comment-avatar {
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 9999px;
  background-color: #dbeafe;
  color: #1d4ed8;
  font-weight: 700;
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.comment-content {
  flex: 1;
}

.comment-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.35rem;
}

.author-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.author-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: #0f172a;
}

.comment-time {
  font-size: 0.75rem;
  color: #64748b;
}

.btn-delete {
  background: transparent;
  border: none;
  font-size: 1.25rem;
  color: #94a3b8;
  cursor: pointer;
  line-height: 1;
}

.btn-delete:hover {
  color: #dc2626;
}

.comment-body {
  font-size: 0.875rem;
  color: #0f172a;
  white-space: pre-wrap;
}

.locked-banner {
  background-color: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 0.85rem;
  font-size: 0.875rem;
  color: #64748b;
  text-align: center;
}

.comment-form textarea {
  width: 100%;
  padding: 0.6rem 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-family: inherit;
  font-size: 0.875rem;
  outline: none;
}

.comment-form textarea:focus {
  border-color: #2563eb;
}

.form-bottom {
  display: flex;
  justify-content: flex-end;
  margin-top: 0.5rem;
}

.staff-sidebar {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.staff-title {
  font-size: 1rem;
  font-weight: 600;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.form-group label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
}

.form-select {
  padding: 0.45rem 0.65rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.875rem;
  font-family: inherit;
}

.full-btn {
  width: 100%;
}

.btn {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid transparent;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-primary {
  background-color: #2563eb;
  color: #ffffff;
}

.btn-primary:hover {
  background-color: #1d4ed8;
}

.btn-secondary {
  background-color: #ffffff;
  border-color: #e2e8f0;
  color: #0f172a;
}

.btn-danger-outline {
  background-color: #ffffff;
  border-color: #fecaca;
  color: #dc2626;
}

.btn-danger-outline:hover {
  background-color: #fee2e2;
}

.empty-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 3rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.forbidden-card h2 {
  color: #dc2626;
}

@media (max-width: 900px) {
  .detail-layout.has-sidebar {
    grid-template-columns: 1fr;
  }
}
</style>
