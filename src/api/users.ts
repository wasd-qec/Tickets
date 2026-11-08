import { apiRequest } from './client'
import type { Role, User } from '@/types'

export async function getUsersApi(): Promise<User[]> {
  const res = await apiRequest<any>('/users')
  if (Array.isArray(res)) return res
  return res?.users || res?.items || res?.data || []
}

export async function updateUserRoleApi(id: string | number, role: Role): Promise<User> {
  const res = await apiRequest<any>(`/users/${id}/role`, {
    method: 'PATCH',
    body: JSON.stringify({ role }),
  })
  return res?.user || res?.data || res
}

