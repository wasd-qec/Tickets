import { mockDb } from '@/data/mockData'
import type { Comment, PaginatedTickets, Ticket, TicketPriority, TicketQueryParams, TicketStatus, User } from '@/types'

function getCurrentUser(): User {
  try {
    const raw = localStorage.getItem('helpdesk_user')
    if (raw) return JSON.parse(raw)
  } catch {}
  return { id: 1, username: 'alice_client', role: 'CLIENT' }
}

export async function getTicketsApi(params: TicketQueryParams = {}): Promise<PaginatedTickets> {
  let tickets = mockDb.getTickets()

  if (params.mine) {
    const user = getCurrentUser()
    tickets = tickets.filter(
      (t) => String(t.authorId ?? t.author?.id) === String(user.id) || t.author?.username === user.username,
    )
  }

  if (params.status) {
    tickets = tickets.filter((t) => t.status === params.status)
  }

  if (params.priority) {
    tickets = tickets.filter((t) => t.priority === params.priority)
  }

  if (params.categoryId !== undefined && params.categoryId !== '') {
    tickets = tickets.filter((t) => String(t.categoryId) === String(params.categoryId))
  }

  if (params.assignedToId !== undefined && params.assignedToId !== '') {
    tickets = tickets.filter(
      (t) => String(t.assignedToId ?? t.assignedTo?.id) === String(params.assignedToId),
    )
  }

  if (params.search && params.search.trim()) {
    const q = params.search.trim().toLowerCase()
    tickets = tickets.filter(
      (t) => t.title?.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q),
    )
  }

  const page = params.page || 1
  const limit = params.limit || 10
  const total = tickets.length
  const totalPages = Math.max(1, Math.ceil(total / limit))
  const start = (page - 1) * limit
  const items = tickets.slice(start, start + limit)

  return { items, total, page, limit, totalPages }
}

export async function getTicketApi(id: string | number): Promise<Ticket> {
  const tickets = mockDb.getTickets()
  const ticket = tickets.find((t) => String(t.id) === String(id))
  if (!ticket) {
    const error: any = new Error('Ticket not found')
    error.status = 404
    throw error
  }
  return ticket
}

export async function createTicketApi(payload: {
  title: string
  description: string
  categoryId: string | number
}): Promise<Ticket> {
  const tickets = mockDb.getTickets()
  const categories = mockDb.getCategories()
  const cat = categories.find((c) => String(c.id) === String(payload.categoryId))
  const user = getCurrentUser()

  const newTicket: Ticket = {
    id: 100 + tickets.length + 1,
    title: payload.title,
    description: payload.description,
    status: 'OPEN',
    priority: 'MEDIUM',
    categoryId: payload.categoryId,
    category: cat,
    authorId: user.id,
    author: user,
    assignedToId: null,
    assignedTo: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  tickets.unshift(newTicket)
  mockDb.saveTickets(tickets)
  return newTicket
}

export async function updateTicketApi(
  id: string | number,
  payload: {
    status?: TicketStatus
    priority?: TicketPriority
    categoryId?: string | number
    assignedToId?: string | number | null
  },
): Promise<Ticket> {
  const tickets = mockDb.getTickets()
  const idx = tickets.findIndex((t) => String(t.id) === String(id))
  if (idx === -1) {
    throw new Error('Ticket not found')
  }

  const existing = tickets[idx]!
  const users = mockDb.getUsers()
  const categories = mockDb.getCategories()
  let assignedTo = existing.assignedTo
  let category = existing.category

  if (payload.assignedToId !== undefined) {
    assignedTo = payload.assignedToId
      ? users.find((u) => String(u.id) === String(payload.assignedToId)) || null
      : null
  }

  if (payload.categoryId !== undefined) {
    category = categories.find((c) => String(c.id) === String(payload.categoryId)) || existing.category
  }

  const updated: Ticket = {
    ...existing,
    status: payload.status ?? existing.status,
    priority: payload.priority ?? existing.priority,
    categoryId: payload.categoryId !== undefined ? payload.categoryId : existing.categoryId,
    category,
    assignedToId: payload.assignedToId !== undefined ? payload.assignedToId : existing.assignedToId,
    assignedTo,
    updatedAt: new Date().toISOString(),
  }

  tickets[idx] = updated
  mockDb.saveTickets(tickets)

  const comments = mockDb.getComments()
  if (
    payload.assignedToId !== undefined &&
    String(payload.assignedToId ?? '') !== String(existing.assignedToId ?? '')
  ) {
    comments.push({
      id: Date.now(),
      ticketId: id,
      content: assignedTo
        ? `Ticket assigned to ${assignedTo.username}`
        : 'Ticket unassigned',
      isSystem: true,
      createdAt: new Date().toISOString(),
    })
  }
  if (payload.status && payload.status !== existing.status) {
    comments.push({
      id: Date.now() + 1,
      ticketId: id,
      content: `Status changed from ${existing.status} to ${payload.status}`,
      isSystem: true,
      createdAt: new Date().toISOString(),
    })
  }
  if (
    payload.categoryId !== undefined &&
    String(payload.categoryId) !== String(existing.categoryId) &&
    category
  ) {
    comments.push({
      id: Date.now() + 2,
      ticketId: id,
      content: `Category changed to ${category.name}`,
      isSystem: true,
      createdAt: new Date().toISOString(),
    })
  }
  mockDb.saveComments(comments)

  return updated
}

export async function cancelTicketApi(id: string | number): Promise<Ticket> {
  return updateTicketApi(id, { status: 'CANCELLED' })
}

export async function closeTicketApi(id: string | number): Promise<Ticket> {
  return updateTicketApi(id, { status: 'CLOSED' })
}

export async function getCommentsApi(ticketId: string | number): Promise<Comment[]> {
  const comments = mockDb.getComments()
  return comments.filter((c) => String(c.ticketId) === String(ticketId))
}

export async function addCommentApi(ticketId: string | number, content: string): Promise<Comment> {
  const comments = mockDb.getComments()
  const user = getCurrentUser()

  const newComment: Comment = {
    id: Date.now(),
    ticketId,
    content,
    isSystem: false,
    authorId: user.id,
    author: user,
    createdAt: new Date().toISOString(),
  }

  comments.push(newComment)
  mockDb.saveComments(comments)
  return newComment
}

export async function deleteCommentApi(commentId: string | number): Promise<void> {
  const comments = mockDb.getComments()
  const filtered = comments.filter((c) => String(c.id) !== String(commentId))
  mockDb.saveComments(filtered)
}
