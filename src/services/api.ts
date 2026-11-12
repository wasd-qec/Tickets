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

export const api = {
  async getTickets(): Promise<Tickets[]> {
    return request<Tickets[]>('/tickets')
  },

  async getTicketById(id: number): Promise<Tickets> {
    return request<Tickets>(`/tickets/${id}`)
  },

  async createTicket(ticket: Omit<Tickets, 'TicketID'> & { TicketID?: number }): Promise<Tickets> {
    return request<Tickets>('/tickets', {
      method: 'POST',
      body: JSON.stringify(ticket),
    })
  },

  async updateTicket(id: number, data: Partial<Tickets>): Promise<Tickets> {
    return request<Tickets>(`/tickets/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },

  async getCommentsByTicket(ticketId: number): Promise<Comment[]> {
    return request<Comment[]>(`/comments?TicketID=${ticketId}`)
  },

  async addComment(comment: Omit<Comment, 'CommentID'> & { CommentID?: number }): Promise<Comment> {
    return request<Comment>('/comments', {
      method: 'POST',
      body: JSON.stringify(comment),
    })
  },

  async getCategories(): Promise<Category[]> {
    return request<Category[]>('/categories')
  },

  async createCategory(category: Omit<Category, 'CategroyID'> & { CategroyID?: number }): Promise<Category> {
    return request<Category>('/categories', {
      method: 'POST',
      body: JSON.stringify(category),
    })
  },

  async updateCategory(id: number, data: Partial<Category>): Promise<Category> {
    return request<Category>(`/categories/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },

  async deleteCategory(id: number): Promise<void> {
    await request<void>(`/categories/${id}`, {
      method: 'DELETE',
    })
  },

  async getUsers(): Promise<User[]> {
    return request<User[]>('/users')
  },

  async createUser(user: Omit<User, 'id'> & { id?: number }): Promise<User> {
    return request<User>('/users', {
      method: 'POST',
      body: JSON.stringify(user),
    })
  },

  async updateUser(id: number, data: Partial<User>): Promise<User> {
    return request<User>(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },

  async deleteUser(id: number): Promise<void> {
    await request<void>(`/users/${id}`, {
      method: 'DELETE',
    })
  },
}
