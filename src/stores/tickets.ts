import { ref } from 'vue'
import { defineStore } from 'pinia'
import {
  addCommentApi,
  cancelTicketApi,
  closeTicketApi,
  createTicketApi,
  deleteCommentApi,
  getCommentsApi,
  getTicketApi,
  getTicketsApi,
  updateTicketApi,
} from '@/api/tickets'
import type {
  Comment,
  Ticket,
  TicketPriority,
  TicketQueryParams,
  TicketStatus,
} from '@/types'

export const useTicketsStore = defineStore('tickets', () => {
  const tickets = ref<Ticket[]>([])
  const total = ref(0)
  const page = ref(1)
  const limit = ref(10)
  const totalPages = ref(1)
  const loading = ref(false)

  const currentTicket = ref<Ticket | null>(null)
  const comments = ref<Comment[]>([])
  const detailLoading = ref(false)

  async function fetchTickets(params: TicketQueryParams = {}) {
    loading.value = true
    try {
      const res = await getTicketsApi(params)
      tickets.value = res.items
      total.value = res.total
      page.value = res.page
      limit.value = res.limit
      totalPages.value = res.totalPages
      return res
    } finally {
      loading.value = false
    }
  }

  async function fetchTicketDetail(id: string | number) {
    detailLoading.value = true
    try {
      const [ticket, ticketComments] = await Promise.all([
        getTicketApi(id),
        getCommentsApi(id),
      ])
      currentTicket.value = ticket
      comments.value = ticketComments
      return { ticket, comments: ticketComments }
    } finally {
      detailLoading.value = false
    }
  }

  async function refreshTicketAndTimeline(id: string | number) {
    const [ticket, ticketComments] = await Promise.all([
      getTicketApi(id),
      getCommentsApi(id),
    ])
    currentTicket.value = ticket
    comments.value = ticketComments
    return { ticket, comments: ticketComments }
  }

  async function createTicket(payload: {
    title: string
    description: string
    categoryId: string | number
  }) {
    return await createTicketApi(payload)
  }

  async function updateTicket(
    id: string | number,
    payload: {
      status?: TicketStatus
      priority?: TicketPriority
      categoryId?: string | number
      assignedToId?: string | number | null
    },
  ) {
    const updated = await updateTicketApi(id, payload)
    currentTicket.value = updated
    return updated
  }

  async function cancelTicket(id: string | number) {
    const updated = await cancelTicketApi(id)
    const idx = tickets.value.findIndex((t) => String(t.id) === String(id))
    if (idx !== -1 && tickets.value[idx]) {
      tickets.value[idx] = { ...tickets.value[idx], status: 'CANCELLED', ...updated }
    }
    if (currentTicket.value && String(currentTicket.value.id) === String(id)) {
      currentTicket.value = { ...currentTicket.value, status: 'CANCELLED', ...updated }
    }
    return updated
  }

  async function closeTicket(id: string | number) {
    const updated = await closeTicketApi(id)
    if (currentTicket.value && String(currentTicket.value.id) === String(id)) {
      currentTicket.value = { ...currentTicket.value, status: 'CLOSED', ...updated }
    }
    return updated
  }

  async function addComment(ticketId: string | number, content: string) {
    return await addCommentApi(ticketId, content)
  }

  async function deleteComment(commentId: string | number) {
    await deleteCommentApi(commentId)
  }

  return {
    tickets,
    total,
    page,
    limit,
    totalPages,
    loading,
    currentTicket,
    comments,
    detailLoading,
    fetchTickets,
    fetchTicketDetail,
    refreshTicketAndTimeline,
    createTicket,
    updateTicket,
    cancelTicket,
    closeTicket,
    addComment,
    deleteComment,
  }
})

