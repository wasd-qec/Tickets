import type { User } from './User'
import type { Category } from './Categories'
import type { Ticket } from './Ticket'
import type { Comment } from './Comment'

export const mockUsers: User[] = [
  { id: 1, username: 'alice_client', role: 'CLIENT' },
  { id: 2, username: 'charlie_tech', role: 'TECHNICIAN' },
  { id: 3, username: 'admin_user', role: 'ADMIN' },
]

export const mockCategories: Category[] = [
  { id: 1, name: 'Hardware', description: 'Physical equipment issues' },
  { id: 2, name: 'Software', description: 'Applications and OS' },
]

export const mockTickets: Ticket[] = [
  {
    id: 101,
    title: 'Monitor not working',
    description: 'Monitor does not power on',
    createdAt: '2026-11-08T08:00:00.000Z',
    updatedAt: '2026-11-08T08:00:00.000Z',
    authorId: 1,
    status: 'OPEN',
    priority: 'MEDIUM',
    categoryId: 1,
  },
]

export const mockComments: Comment[] = [
  {
    id: 1,
    ticketId: 101,
    authorId: 2,
    isSystem: false,
    content: 'Looking into this now.',
    createdAt: '2026-11-08T09:00:00.000Z',
  },
]
