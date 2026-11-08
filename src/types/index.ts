export type Role = 'CLIENT' | 'TECHNICIAN' | 'ADMIN'

export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'CANCELLED'

export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH'

export interface User {
  id: number | string
  username: string
  role: Role
  createdAt?: string
}

export interface Category {
  id: number | string
  name: string
  description: string
  ticketCount?: number
  activeTicketCount?: number
  _count?: {
    tickets?: number
  }
}

export interface Ticket {
  id: number | string
  title: string
  description: string
  status: TicketStatus
  priority: TicketPriority
  categoryId: number | string
  category?: Category
  categoryName?: string
  authorId?: number | string
  author?: User
  authorUsername?: string
  createdBy?: User
  assignedToId?: number | string | null
  assignedTo?: User | null
  assignedTechnician?: User | null
  createdAt: string
  updatedAt: string
}

export interface Comment {
  id: number | string
  ticketId: number | string
  content?: string
  text?: string
  body?: string
  isSystem?: boolean
  authorId?: number | string
  author?: User
  user?: User
  createdAt: string
}

export interface PaginatedTickets {
  items: Ticket[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface TicketQueryParams {
  page?: number
  limit?: number
  search?: string
  status?: string
  priority?: string
  categoryId?: string | number
  mine?: boolean
}

