import { mockDb } from '@/data/mockData'
import type { Role, User } from '@/types'

export async function getUsersApi(): Promise<User[]> {
  return mockDb.getUsers()
}

export async function updateUserRoleApi(id: string | number, role: Role): Promise<User> {
  const users = mockDb.getUsers()
  const idx = users.findIndex((u) => String(u.id) === String(id))
  if (idx === -1) {
    throw new Error('User not found')
  }
  const updated: User = {
    ...users[idx]!,
    role,
  }
  users[idx] = updated
  mockDb.saveUsers(users)
  return updated
}

export async function updateUserApi(
  id: string | number,
  payload: { username: string; role: Role },
): Promise<User> {
  const users = mockDb.getUsers()
  const idx = users.findIndex((u) => String(u.id) === String(id))
  if (idx === -1) {
    throw new Error('User not found')
  }

  const trimmed = payload.username.trim()
  const duplicate = users.some(
    (u) => String(u.id) !== String(id) && u.username.toLowerCase() === trimmed.toLowerCase(),
  )
  if (duplicate) {
    const error: any = new Error('Username already exists')
    error.status = 400
    throw error
  }

  const updated: User = {
    ...users[idx]!,
    username: trimmed,
    role: payload.role,
  }
  users[idx] = updated
  mockDb.saveUsers(users)

  const tickets = mockDb.getTickets().map((t) => {
    const next = { ...t }
    if (String(t.authorId ?? t.author?.id) === String(id)) {
      next.author = { ...updated }
    }
    if (String(t.assignedToId ?? t.assignedTo?.id) === String(id)) {
      next.assignedTo = { ...updated }
    }
    return next
  })
  mockDb.saveTickets(tickets)

  return updated
}
