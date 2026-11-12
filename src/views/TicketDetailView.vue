<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import { api } from '@/services/api'
import type { Priority, Stage, Tickets } from '@/Data/Ticket'
import type { Category } from '@/Data/Categories'
import type { Comment } from '@/Data/Comment'
import type { User } from '@/Data/User'
import StatusBadge from '@/components/StatusBadge.vue'
import PriorityBadge from '@/components/PriorityBadge.vue'
import RoleBadge from '@/components/RoleBadge.vue'
import ConfirmModal from '@/components/ConfirmModal.vue'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const { showToast } = useToast()

const ticketId = computed(() => String(route.params.id))

const ticket = ref<Tickets | null>(null)
const comments = ref<Comment[]>([])
const categories = ref<Category[]>([])
const users = ref<User[]>([])
const isLoading = ref(true)
const errorMessage = ref('')
const isForbidden = ref(false)

const newCommentText = ref('')
const isSubmittingComment = ref(false)
const showCloseConfirm = ref(false)
const commentToDelete = ref<Comment | null>(null)
const isDeletingComment = ref(false)

async function fetchTicketData() {
  isLoading.value = true
  errorMessage.value = ''
  isForbidden.value = false

  try {
    const id = ticketId.value
    const [tData, catData, uData] = await Promise.all([
      api.getTicketById(id),
      api.getCategories(),
      api.getUsers(),
    ])

    if (auth.currentUser?.role === 'CLIENT' && Number(tData.CreateBy) !== Number(auth.currentUser.id)) {
      isForbidden.value = true
      isLoading.value = false
      return
    }

    const queryIds = Array.from(new Set([id, String(tData.TicketID), String(tData.id)].filter(Boolean)))
    const commentBatches = await Promise.all(
      queryIds.map((qId) => api.getCommentsByTicket(qId).catch(() => [] as Comment[]))
    )
    const mergedComments = Array.from(
      new Map(commentBatches.flat().map((c) => [(c.id || c.CommentID), c])).values()
    )

    ticket.value = tData
    comments.value = mergedComments
    categories.value = catData
    users.value = uData
  } catch {
    errorMessage.value = 'Failed to load ticket details or ticket not found.'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchTicketData()
})

const author = computed(() => users.value.find((u) => String(u.id) === String(ticket.value?.CreateBy)))
const assignee = computed(() => users.value.find((u) => String(u.id) === String(ticket.value?.Assignto)))
const category = computed(() => categories.value.find((c) => c.CategroyID === ticket.value?.CategoryID))
const techUsers = computed(() => users.value.filter((u) => u.role === 'TECHNICIAN' || u.role === 'ADMIN'))

const isClient = computed(() => auth.currentUser?.role === 'CLIENT')
const isTech = computed(() => auth.currentUser?.role === 'TECHNICIAN')
const isAdmin = computed(() => auth.currentUser?.role === 'ADMIN')

const isAssignedTech = computed(() => {
  if (!ticket.value || !auth.currentUser) return false
  return String(ticket.value.Assignto) === String(auth.currentUser.id)
})

const isOtherTech = computed(() => {
  if (!ticket.value || !isTech.value) return false
  return ticket.value.Assignto !== undefined && String(ticket.value.Assignto) !== String(auth.currentUser?.id)
})

const canStaffAct = computed(() => {
  if (isAdmin.value) return true
  if (isTech.value && (ticket.value?.Assignto === undefined || isAssignedTech.value)) return true
  return false
})

const canPostComment = computed(() => {
  if (ticket.value?.Stage === 'Closed' || ticket.value?.Stage === 'Cancelled') return false
  if (isAdmin.value) return true
  if (isClient.value && ticket.value?.CreateBy === auth.currentUser?.id) return true
  if (isTech.value && isAssignedTech.value) return true
  return false
})

async function handleClaim() {
  if (!ticket.value || !auth.currentUser) return
  const now = new Date().toISOString()
  try {
    const updated = await api.updateTicket(ticket.value.id || ticket.value.TicketID, {
      Assignto: auth.currentUser.id,
      Stage: ticket.value.Stage === 'Opened' ? 'In Progress' : ticket.value.Stage,
      UpdatedAt: now,
    })
    ticket.value = updated

    const sysComment = await api.addComment({
      TicketID: ticket.value.TicketID,
      CreateBy: auth.currentUser.id,
      SystemMessage: true,
      Message: `Ticket claimed by ${auth.currentUser.username}.`,
      creatAt: now,
    })
    comments.value.push(sysComment)
    showToast('Ticket claimed successfully', 'success')
  } catch {
    showToast('Failed to claim ticket', 'error')
  }
}

async function handleAssigneeChange(event: Event) {
  if (!ticket.value || !auth.currentUser) return
  const target = event.target as HTMLSelectElement
  const newAssigneeId = target.value ? target.value : undefined
  const now = new Date().toISOString()
  const assignedUser = users.value.find((u) => String(u.id) === String(newAssigneeId))

  try {
    const updated = await api.updateTicket(ticket.value.id || ticket.value.TicketID, {
      Assignto: newAssigneeId,
      UpdatedAt: now,
    })
    ticket.value = updated

    const msg = assignedUser
      ? `Ticket assigned to ${assignedUser.username} by ${auth.currentUser.username}.`
      : `Ticket unassigned by ${auth.currentUser.username}.`
    const sysComment = await api.addComment({
      TicketID: ticket.value.TicketID,
      CreateBy: auth.currentUser.id,
      SystemMessage: true,
      Message: msg,
      creatAt: now,
    })
    comments.value.push(sysComment)
    showToast('Assignee updated', 'success')
  } catch {
    showToast('Failed to update assignee', 'error')
  }
}

async function handleCategoryChange(event: Event) {
  if (!ticket.value || !auth.currentUser) return
  const target = event.target as HTMLSelectElement
  const newCatId = Number(target.value)
  const catObj = categories.value.find((c) => c.CategroyID === newCatId)
  const now = new Date().toISOString()

  try {
    const updated = await api.updateTicket(ticket.value.id || ticket.value.TicketID, {
      CategoryID: newCatId,
      UpdatedAt: now,
    })
    ticket.value = updated

    const sysComment = await api.addComment({
      TicketID: ticket.value.TicketID,
      CreateBy: auth.currentUser.id,
      SystemMessage: true,
      Message: `Category changed to ${catObj?.name || 'General'}.`,
      creatAt: now,
    })
    comments.value.push(sysComment)
    showToast('Category updated', 'success')
  } catch {
    showToast('Failed to update category', 'error')
  }
}

async function handlePriorityChange(event: Event) {
  if (!ticket.value || !auth.currentUser) return
  const target = event.target as HTMLSelectElement
  const newPriority = target.value as Priority
  const now = new Date().toISOString()

  try {
    const updated = await api.updateTicket(ticket.value.id || ticket.value.TicketID, {
      Priority: newPriority,
      UpdatedAt: now,
    })
    ticket.value = updated

    const sysComment = await api.addComment({
      TicketID: ticket.value.TicketID,
      CreateBy: auth.currentUser.id,
      SystemMessage: true,
      Message: `Priority changed to ${newPriority}.`,
      creatAt: now,
    })
    comments.value.push(sysComment)
    showToast('Priority updated', 'success')
  } catch {
    showToast('Failed to update priority', 'error')
  }
}

async function handleStatusChange(event: Event) {
  if (!ticket.value || !auth.currentUser) return
  const target = event.target as HTMLSelectElement
  const newStage = target.value as Stage
  const now = new Date().toISOString()

  try {
    const updated = await api.updateTicket(ticket.value.id || ticket.value.TicketID, {
      Stage: newStage,
      UpdatedAt: now,
    })
    ticket.value = updated

    const sysComment = await api.addComment({
      TicketID: ticket.value.TicketID,
      CreateBy: auth.currentUser.id,
      SystemMessage: true,
      Message: `Status changed to ${newStage}.`,
      creatAt: now,
    })
    comments.value.push(sysComment)
    showToast('Status updated', 'success')
  } catch {
    showToast('Failed to update status', 'error')
  }
}

async function confirmCloseTicket() {
  if (!ticket.value || !auth.currentUser) return
  showCloseConfirm.value = false
  const now = new Date().toISOString()

  try {
    const updated = await api.updateTicket(ticket.value.id || ticket.value.TicketID, {
      Stage: 'Closed',
      UpdatedAt: now,
    })
    ticket.value = updated

    const sysComment = await api.addComment({
      TicketID: ticket.value.TicketID,
      CreateBy: auth.currentUser.id,
      SystemMessage: true,
      Message: `Ticket closed by ${auth.currentUser.username}.`,
      creatAt: now,
    })
    comments.value.push(sysComment)
    showToast('Ticket marked as Closed', 'success')
  } catch {
    showToast('Failed to close ticket', 'error')
  }
}

async function handleAddComment() {
  if (!ticket.value || !auth.currentUser || !newCommentText.value.trim()) return
  isSubmittingComment.value = true
  const now = new Date().toISOString()

  try {
    const newComment = await api.addComment({
      TicketID: ticket.value.TicketID,
      CreateBy: auth.currentUser.id,
      SystemMessage: false,
      Message: newCommentText.value.trim(),
      creatAt: now,
    })
    comments.value.push(newComment)
    await api.updateTicket(ticket.value.id || ticket.value.TicketID, { UpdatedAt: now })
    ticket.value.UpdatedAt = now
    newCommentText.value = ''
    showToast('Comment posted', 'success')
  } catch {
    showToast('Failed to post comment', 'error')
  } finally {
    isSubmittingComment.value = false
  }
}

function getCommentAuthor(id?: number | string) {
  if (!id) return null
  return users.value.find((u) => String(u.id) === String(id))
}

function getInitials(name?: string): string {
  if (!name) return '?'
  const clean = name.trim()
  const parts = clean.split(/[\s_.-]+/).filter(Boolean)
  if (parts.length >= 2 && parts[0] && parts[1]) {
    return (parts[0][0]! + parts[1][0]!).toUpperCase()
  }
  return clean.slice(0, 2).toUpperCase()
}

async function handleConfirmDeleteComment() {
  if (!commentToDelete.value) return
  isDeletingComment.value = true
  try {
    const id = commentToDelete.value.id || commentToDelete.value.CommentID
    if (id) {
      await api.deleteComment(id)
      comments.value = comments.value.filter((c) => (c.id || c.CommentID) !== id)
      showToast('Comment deleted', 'success')
    }
  } catch {
    showToast('Failed to delete comment', 'error')
  } finally {
    isDeletingComment.value = false
    commentToDelete.value = null
  }
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<template>
  <div class="detail-page">
    <div v-if="isLoading" class="state-card">
      <div class="spinner"></div>
      <p class="state-text">Loading ticket details...</p>
    </div>

    <div v-else-if="isForbidden" class="error-page">
      <div class="error-icon">403</div>
      <h2 class="error-title">Access Denied</h2>
      <p class="error-desc">You do not have permission to view tickets submitted by other users.</p>
      <button type="button" class="btn-primary" @click="router.push('/tickets')">
        Back to My Tickets
      </button>
    </div>

    <div v-else-if="errorMessage || !ticket" class="error-page">
      <div class="error-icon">404</div>
      <h2 class="error-title">Ticket Not Found</h2>
      <p class="error-desc">{{ errorMessage || 'The requested ticket could not be found.' }}</p>
      <button type="button" class="btn-primary" @click="fetchTicketData">Retry</button>
    </div>

    <div v-else class="detail-container">
      <div class="detail-main">
        <button type="button" class="btn-back" @click="router.back()">&larr; Back</button>

        <div v-if="isOtherTech" class="view-only-banner">
          This ticket is claimed by <strong>{{ assignee?.username }}</strong>. You are in view-only mode.
        </div>

        <div class="ticket-header-card">
          <div class="header-top">
            <span class="ticket-id-tag">#{{ ticket.TicketID }}</span>
            <div class="header-badges">
              <PriorityBadge :priority="ticket.Priority" />
              <StatusBadge :Stage="ticket.Stage" />
            </div>
          </div>

          <h1 class="ticket-title">{{ ticket.Name }}</h1>

          <div class="header-meta">
            <span>Opened by <strong>{{ author?.username || `User #${ticket.CreateBy}` }}</strong></span>
            <span>&middot;</span>
            <span>{{ formatDateTime(ticket.CreateAt) }}</span>
            <span>&middot;</span>
            <span>Category: <strong>{{ category?.name || 'General' }}</strong></span>
          </div>

          <div class="ticket-desc-box">
            <h3 class="desc-heading">Description</h3>
            <p v-if="ticket.Description" class="desc-content">{{ ticket.Description }}</p>
            <p v-else class="desc-empty">No additional description provided.</p>
          </div>
        </div>

        <div class="timeline-card">
          <h2 class="timeline-title">Discussion Timeline</h2>

          <div v-if="comments.length === 0" class="no-comments">
            No comments or activity yet.
          </div>

          <div v-else class="comments-list">
            <template v-for="cmt in comments" :key="cmt.CommentID || cmt.id">
              <div v-if="cmt.SystemMessage" class="system-event">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 8v4l2.5 2.5" stroke-linecap="round" />
                </svg>
                <span>{{ cmt.Message }}</span>
                <span class="system-time">&middot; {{ formatDateTime(cmt.creatAt) }}</span>
              </div>

              <div v-else class="comment-item">
                <div class="avatar">{{ getInitials(getCommentAuthor(cmt.CreateBy)?.username) }}</div>
                <div class="comment-body">
                  <div class="comment-header">
                    <div class="comment-author-meta">
                      <span class="comment-author">{{ getCommentAuthor(cmt.CreateBy)?.username || 'User' }}</span>
                      <RoleBadge v-if="getCommentAuthor(cmt.CreateBy)?.role" :role="getCommentAuthor(cmt.CreateBy)!.role" />
                      <span class="comment-time">{{ formatDateTime(cmt.creatAt) }}</span>
                    </div>
                    <button
                      v-if="isAdmin"
                      type="button"
                      class="btn-icon"
                      title="Delete comment"
                      @click="commentToDelete = cmt"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z" stroke-linecap="round" stroke-linejoin="round" />
                      </svg>
                    </button>
                  </div>
                  <div class="comment-text">{{ cmt.Message }}</div>
                </div>
              </div>
            </template>
          </div>

          <div v-if="canPostComment" class="comment-box">
            <textarea
              v-model="newCommentText"
              rows="3"
              placeholder="Write a comment..."
              class="comment-textarea"
            ></textarea>
            <div class="comment-actions">
              <button
                type="button"
                class="btn-post-comment"
                :disabled="!newCommentText.trim() || isSubmittingComment"
                @click="handleAddComment"
              >
                {{ isSubmittingComment ? 'Posting...' : 'Post comment' }}
              </button>
            </div>
          </div>
          <div v-else class="locked-banner">
            Commenting is disabled for this ticket.
          </div>
        </div>
      </div>

      <div class="detail-sidebar">
        <div class="sidebar-card">
          <h3 class="sidebar-title">Ticket Information</h3>

          <div class="info-row">
            <span class="info-label">Status</span>
            <StatusBadge :Stage="ticket.Stage" />
          </div>

          <div class="info-row">
            <span class="info-label">Priority</span>
            <PriorityBadge :priority="ticket.Priority" />
          </div>

          <div class="info-row">
            <span class="info-label">Category</span>
            <span class="info-val">{{ category?.name || 'General' }}</span>
          </div>

          <div class="info-row">
            <span class="info-label">Assigned To</span>
            <span v-if="assignee" class="info-val font-semibold">{{ assignee.username }}</span>
            <span v-else class="info-val italic text-muted">Unassigned</span>
          </div>

          <div class="info-row">
            <span class="info-label">Created</span>
            <span class="info-val">{{ formatDateTime(ticket.CreateAt) }}</span>
          </div>

          <div class="info-row">
            <span class="info-label">Updated</span>
            <span class="info-val">{{ formatDateTime(ticket.UpdatedAt) }}</span>
          </div>
        </div>

        <div v-if="canStaffAct" class="sidebar-card staff-card">
          <h3 class="sidebar-title">Staff Actions</h3>

          <div v-if="!ticket.Assignto && isTech" class="action-item">
            <button type="button" class="btn-claim" @click="handleClaim">
              Claim this ticket
            </button>
          </div>

          <div v-if="isAdmin" class="action-item">
            <label class="action-label">Assignee</label>
            <select :value="ticket.Assignto || ''" class="action-select" @change="handleAssigneeChange">
              <option value="">Unassigned</option>
              <option v-for="t in techUsers" :key="t.id" :value="t.id">
                {{ t.username }} ({{ t.role }})
              </option>
            </select>
          </div>

          <div class="action-item">
            <label class="action-label">Category</label>
            <select :value="ticket.CategoryID" class="action-select" @change="handleCategoryChange">
              <option v-for="c in categories" :key="c.CategroyID" :value="c.CategroyID">
                {{ c.name }}
              </option>
            </select>
          </div>

          <div class="action-item">
            <label class="action-label">Priority</label>
            <select :value="ticket.Priority" class="action-select" @change="handlePriorityChange">
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          <div class="action-item">
            <label class="action-label">Status</label>
            <select :value="ticket.Stage" class="action-select" @change="handleStatusChange">
              <option value="Opened">Opened</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div v-if="ticket.Stage !== 'Closed' && ticket.Stage !== 'Cancelled'" class="action-item mt-4">
            <button type="button" class="btn-close-ticket" @click="showCloseConfirm = true">
              Close Ticket
            </button>
          </div>
        </div>
      </div>
    </div>

    <ConfirmModal
      :open="showCloseConfirm"
      title="Close Ticket"
      message="Are you sure you want to close this ticket? This indicates the issue has reached its final resolved state."
      confirm-text="Yes, Close Ticket"
      confirm-type="danger"
      @confirm="confirmCloseTicket"
      @cancel="showCloseConfirm = false"
    />

    <ConfirmModal
      :open="Boolean(commentToDelete)"
      title="Delete Comment"
      message="Are you sure you want to permanently delete this comment?"
      confirm-text="Delete"
      confirm-type="danger"
      @confirm="handleConfirmDeleteComment"
      @cancel="commentToDelete = null"
    />
  </div>
</template>

<style scoped>
.detail-page {
  display: flex;
  flex-direction: column;
}

.state-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 4rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.spinner {
  width: 36px;
  height: 36px;
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

.error-page {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 4rem 2rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.error-icon {
  font-size: 3rem;
  font-weight: 800;
  color: #94a3b8;
  margin-bottom: 0.5rem;
}

.error-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 0.5rem 0;
}

.error-desc {
  color: #64748b;
  max-width: 440px;
  margin: 0 0 1.5rem 0;
}

.btn-primary {
  background: #2563eb;
  color: #ffffff;
  border: none;
  padding: 0.6rem 1.25rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
}

.detail-container {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 1.5rem;
}

@media (max-width: 880px) {
  .detail-container {
    grid-template-columns: 1fr;
  }
}

.detail-main {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.btn-back {
  align-self: flex-start;
  background: none;
  border: none;
  color: #2563eb;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
}

.btn-back:hover {
  text-decoration: underline;
}

.view-only-banner {
  background: #fef9c3;
  border: 1px solid #fde047;
  color: #854d0e;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
}

.ticket-header-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.ticket-id-tag {
  font-weight: 700;
  color: #64748b;
  font-size: 0.9rem;
}

.header-badges {
  display: flex;
  gap: 0.5rem;
}

.ticket-title {
  font-size: 1.4rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
  line-height: 1.3;
}

.header-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: #64748b;
}

.ticket-desc-box {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1rem;
  margin-top: 0.5rem;
}

.desc-heading {
  font-size: 0.85rem;
  font-weight: 700;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0 0 0.5rem 0;
}

.desc-content {
  font-size: 0.925rem;
  color: #1e293b;
  margin: 0;
  white-space: pre-wrap;
  line-height: 1.5;
}

.desc-empty {
  color: #94a3b8;
  font-style: italic;
  margin: 0;
  font-size: 0.875rem;
}

.timeline-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.timeline-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.no-comments {
  color: #94a3b8;
  font-style: italic;
  font-size: 0.875rem;
  padding: 1rem 0;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.system-event {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  color: #64748b;
  font-size: 0.8125rem;
  text-align: center;
  padding: 0.35rem 0.75rem;
}

.system-time {
  font-size: 0.75rem;
  color: #94a3b8;
}

.comment-item {
  display: flex;
  gap: 0.75rem;
  padding: 0.9rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #ffffff;
}

.avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: #e2e8f0;
  color: #334155;
  font-weight: 700;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
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
  color: #0f172a;
}

.comment-time {
  font-size: 0.75rem;
  color: #94a3b8;
}

.btn-icon {
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 0.2rem;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.15s ease;
}

.btn-icon:hover {
  color: #dc2626;
}

.comment-text {
  font-size: 0.9rem;
  color: #334155;
  white-space: pre-wrap;
  line-height: 1.5;
  margin: 0;
}

.locked-banner {
  padding: 0.85rem 1rem;
  border-radius: 8px;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  color: #64748b;
  font-size: 0.875rem;
  font-weight: 500;
  text-align: center;
}

.comment-box {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.comment-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-family: inherit;
  font-size: 0.9rem;
  outline: none;
  resize: vertical;
}

.comment-textarea:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.15);
}

.comment-actions {
  display: flex;
  justify-content: flex-end;
}

.btn-post-comment {
  background: #2563eb;
  color: #ffffff;
  border: none;
  border-radius: 6px;
  padding: 0.55rem 1.25rem;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
}

.btn-post-comment:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.detail-sidebar {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.sidebar-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.sidebar-title {
  font-size: 1rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 0.25rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #f1f5f9;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
}

.info-label {
  color: #64748b;
}

.info-val {
  color: #0f172a;
}

.action-item {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.action-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #475569;
}

.action-select {
  padding: 0.5rem 0.65rem;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 0.85rem;
  background: #ffffff;
}

.btn-claim {
  background: #16a34a;
  color: #ffffff;
  border: none;
  border-radius: 6px;
  padding: 0.6rem;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  width: 100%;
}

.btn-claim:hover {
  background: #15803d;
}

.btn-close-ticket {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
  border-radius: 6px;
  padding: 0.55rem;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  width: 100%;
}

.btn-close-ticket:hover {
  background: #fee2e2;
}

.mt-4 {
  margin-top: 0.75rem;
}

.italic {
  font-style: italic;
}

.text-muted {
  color: #94a3b8;
}

.font-semibold {
  font-weight: 600;
}
</style>
