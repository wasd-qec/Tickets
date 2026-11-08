import { mockDb } from '@/data/mockData'
import type { User } from '@/types'

export interface AuthResponse {
  token?: string
  user?: User
}

function createMockToken(user: User): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const payload = btoa(
    JSON.stringify({
      sub: user.id,
      id: user.id,
      username: user.username,
      role: user.role,
    }),
  )
  return `${header}.${payload}.mockSignature`
}

export async function loginApi(payload: { username: string; password: string }): Promise<AuthResponse> {
  const users = mockDb.getUsers()
  let user = users.find((u) => u.username.toLowerCase() === payload.username.trim().toLowerCase())

  if (!user) {
    user = {
      id: Date.now(),
      username: payload.username.trim(),
      role: 'CLIENT',
      createdAt: new Date().toISOString(),
    }
    users.push(user)
    mockDb.saveUsers(users)
  }

  const token = createMockToken(user)
  return { token, user }
}

export async function registerApi(payload: { username: string; password: string }): Promise<AuthResponse> {
  const users = mockDb.getUsers()
  const exists = users.some((u) => u.username.toLowerCase() === payload.username.trim().toLowerCase())

  if (exists) {
    const error: any = new Error('Username already exists')
    error.status = 400
    throw error
  }

  const user: User = {
    id: Date.now(),
    username: payload.username.trim(),
    role: 'CLIENT',
    createdAt: new Date().toISOString(),
  }
  users.push(user)
  mockDb.saveUsers(users)

  const token = createMockToken(user)
  return { token, user }
}
