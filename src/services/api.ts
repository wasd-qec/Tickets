import type { User } from '@/Data/User'
import type { Category } from '@/Data/Categories'
import type { Ticket } from '@/Data/Ticket'
import type { Comment } from '@/Data/Comment'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
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

export async function getNextId(endpoint: string): Promise<number> {
  const items = await request<any[]>(endpoint)
  const numericIds = items
    .map(item => Number(item.id))
    .filter(id => !isNaN(id))
  return numericIds.length > 0 ? Math.max(...numericIds) + 1 : items.length + 1
}

// User API
export const getUsers = () => request<User[]>('/users')
export const getUserById = (id: number | string) => request<User>(`/users/${id}`)
export const createUser = (data: Partial<User> & { password?: string }) =>
  request<User>('/users', { method: 'POST', body: JSON.stringify(data) })

// Category API
export const getCategories = () => request<Category[]>('/categories')
export const getCategoryById = (id: number | string) => request<Category>(`/categories/${id}`)
export const createCategory = (data: Partial<Category>) =>
  request<Category>('/categories', { method: 'POST', body: JSON.stringify(data) })
export const updateCategory = (id: number | string, data: Partial<Category>) =>
  request<Category>(`/categories/${id}`, { method: 'PATCH', body: JSON.stringify(data) })
export const deleteCategory = (id: number | string) =>
  request<void>(`/categories/${id}`, { method: 'DELETE' })

// Ticket API
export const getTickets = () => request<Ticket[]>('/tickets')
export const getTicketById = (id: number | string) => request<Ticket>(`/tickets/${id}`)
export const createTicket = (data: Partial<Ticket>) =>
  request<Ticket>('/tickets', { method: 'POST', body: JSON.stringify(data) })
export const updateTicket = (id: number | string, data: Partial<Ticket>) =>
  request<Ticket>(`/tickets/${id}`, { method: 'PATCH', body: JSON.stringify(data) })
export const deleteTicket = (id: number | string) =>
  request<void>(`/tickets/${id}`, { method: 'DELETE' })

// Comment API
export const getCommentsByTicket = (ticketId: number | string) =>
  request<Comment[]>(`/comments?ticketId=${ticketId}`)
export const addComment = (data: Partial<Comment>) =>
  request<Comment>('/comments', { method: 'POST', body: JSON.stringify(data) })
export const deleteComment = (id: number | string) =>
  request<void>(`/comments/${id}`, { method: 'DELETE' })
