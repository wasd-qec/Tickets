import type { Tickets } from '@/Data/Ticket'
import type { Category } from '@/Data/Categories'
import type { Comment } from '@/Data/Comment'
import type { User } from '@/Data/User'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  })

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

async function getNextId(endpoint: string): Promise<number> {
  try {
    const items = await request<any[]>(endpoint)
    const numericIds = items
      .map((item) => Number(item.TicketID ?? item.CommentID ?? item.CategroyID ?? item.id))
      .filter((id) => !isNaN(id))
    return numericIds.length > 0 ? Math.max(...numericIds) + 1 : items.length + 1
  } catch {
    return 1
  }
}

export const api = {
  async getTickets(): Promise<Tickets[]> {
    return request<Tickets[]>('/tickets')
  },

  async getTicketById(id: string | number): Promise<Tickets> {
    return request<Tickets>(`/tickets/${id}`)
  },

  async createTicket(ticket: Omit<Tickets, 'TicketID'> & { TicketID?: number }): Promise<Tickets> {
    const nextId = await getNextId('/tickets')
    const payload = {
      ...ticket,
      id: String(nextId),
      TicketID: nextId,
    }
    return request<Tickets>('/tickets', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  async updateTicket(id: string | number, data: Partial<Tickets>): Promise<Tickets> {
    return request<Tickets>(`/tickets/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },

  async getCommentsByTicket(ticketId: string | number): Promise<Comment[]> {
    const numericTicketId = Number(ticketId)
    const query = isNaN(numericTicketId) ? ticketId : numericTicketId
    return request<Comment[]>(`/comments?TicketID=${query}`)
  },

  async addComment(comment: Omit<Comment, 'CommentID'> & { CommentID?: number }): Promise<Comment> {
    const nextId = await getNextId('/comments')
    const parsedTicketId = Number(comment.TicketID)
    const payload = {
      ...comment,
      id: String(nextId),
      CommentID: nextId,
      TicketID: isNaN(parsedTicketId) ? comment.TicketID : parsedTicketId,
    }
    return request<Comment>('/comments', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  async deleteComment(id: string | number): Promise<void> {
    await request<void>(`/comments/${id}`, {
      method: 'DELETE',
    })
  },

  async getCategories(): Promise<Category[]> {
    return request<Category[]>('/categories')
  },

  async createCategory(category: Omit<Category, 'CategroyID'> & { CategroyID?: number }): Promise<Category> {
    const nextId = await getNextId('/categories')
    const payload = {
      ...category,
      id: String(nextId),
      CategroyID: nextId,
    }
    return request<Category>('/categories', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  async updateCategory(id: number | string, data: Partial<Category>): Promise<Category> {
    return request<Category>(`/categories/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },

  async deleteCategory(id: number | string): Promise<void> {
    await request<void>(`/categories/${id}`, {
      method: 'DELETE',
    })
  },

  async getUsers(): Promise<User[]> {
    return request<User[]>('/users')
  },

  async createUser(user: Omit<User, 'id'> & { id?: number | string }): Promise<User> {
    const nextId = await getNextId('/users')
    const payload = {
      ...user,
      id: String(nextId),
    }
    return request<User>('/users', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  async updateUser(id: number | string, data: Partial<User>): Promise<User> {
    return request<User>(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },

  async deleteUser(id: number | string): Promise<void> {
    await request<void>(`/users/${id}`, {
      method: 'DELETE',
    })
  },
}
