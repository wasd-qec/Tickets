import { apiRequest } from './client'
import type { Comment, PaginatedTickets, Ticket, TicketPriority, TicketQueryParams, TicketStatus } from '@/types'

export async function getTicketsApi(params: TicketQueryParams = {}): Promise<PaginatedTickets> {
  const query = new URLSearchParams()
  if (params.page !== undefined) query.set('page', String(params.page))
  if (params.limit !== undefined) query.set('limit', String(params.limit))
  if (params.search) query.set('search', params.search)
  if (params.status) query.set('status', params.status)
  if (params.priority) query.set('priority', params.priority)
  if (params.categoryId !== undefined && params.categoryId !== '') {
    query.set('categoryId', String(params.categoryId))
  }
  if (params.mine !== undefined) query.set('mine', String(params.mine))

  const qs = query.toString()
  const res = await apiRequest<any>(`/tickets${qs ? `?${qs}` : ''}`)

  if (Array.isArray(res)) {
    return {
      items: res,
      total: res.length,
      page: params.page || 1,
      limit: params.limit || 10,
      totalPages: Math.max(1, Math.ceil(res.length / (params.limit || 10))),
    }
  }

  const items: Ticket[] = res?.items || res?.data || res?.tickets || []
  const total: number = res?.total ?? res?.totalCount ?? res?.meta?.total ?? items.length
  const page: number = res?.page ?? res?.meta?.page ?? params.page ?? 1
  const limit: number = res?.limit ?? res?.meta?.limit ?? params.limit ?? 10
  const totalPages: number =
    res?.totalPages ?? res?.meta?.totalPages ?? Math.max(1, Math.ceil(total / limit))

  return { items, total, page, limit, totalPages }
}

export async function getTicketApi(id: string | number): Promise<Ticket> {
  const res = await apiRequest<any>(`/tickets/${id}`)
  return res?.ticket || res?.data || res
}

export async function createTicketApi(payload: {
  title: string
  description: string
  categoryId: string | number
}): Promise<Ticket> {
  const res = await apiRequest<any>('/tickets', {
    method: 'POST',
    body: JSON.stringify({
      ...payload,
      categoryId: isNaN(Number(payload.categoryId)) ? payload.categoryId : Number(payload.categoryId),
    }),
  })
  return res?.ticket || res?.data || res
}

export async function updateTicketApi(
  id: string | number,
  payload: {
    status?: TicketStatus
    priority?: TicketPriority
    assignedToId?: string | number | null
  },
): Promise<Ticket> {
  const res = await apiRequest<any>(`/tickets/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
  return res?.ticket || res?.data || res
}

export async function cancelTicketApi(id: string | number): Promise<Ticket> {
  const res = await apiRequest<any>(`/tickets/${id}/cancel`, {
    method: 'POST',
  })
  return res?.ticket || res?.data || res
}

export async function closeTicketApi(id: string | number): Promise<Ticket> {
  const res = await apiRequest<any>(`/tickets/${id}/close`, {
    method: 'POST',
  })
  return res?.ticket || res?.data || res
}

export async function getCommentsApi(ticketId: string | number): Promise<Comment[]> {
  const res = await apiRequest<any>(`/tickets/${ticketId}/comments`)
  if (Array.isArray(res)) return res
  return res?.comments || res?.items || res?.data || []
}

export async function addCommentApi(ticketId: string | number, content: string): Promise<Comment> {
  const res = await apiRequest<any>(`/tickets/${ticketId}/comments`, {
    method: 'POST',
    body: JSON.stringify({ content, text: content }),
  })
  return res?.comment || res?.data || res
}

export async function deleteCommentApi(commentId: string | number): Promise<void> {
  await apiRequest<void>(`/comments/${commentId}`, {
    method: 'DELETE',
  })
}

