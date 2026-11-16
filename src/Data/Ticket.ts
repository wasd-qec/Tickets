import type { User } from './User'
import type { Category } from './Categories'

export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'CANCELLED'
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH'

export interface Ticket {
  id: number
  title: string
  description?: string
  status: TicketStatus
  priority: TicketPriority
  categoryId: number
  category?: Category
  authorId: number
  author?: User
  assignedToId?: number
  assignedTo?: User
  closedAt?: string
  createdAt: string
  updatedAt: string
}

// Backwards-compatible aliases
export type Stage = TicketStatus
export type Priority = TicketPriority
export type Tickets = Ticket
