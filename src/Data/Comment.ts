import type { User } from './User'

export interface Comment {
  id: number
  ticketId: number
  authorId?: number
  author?: User
  content: string
  isSystem: boolean
  createdAt: string
}
