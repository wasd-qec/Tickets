import { apiRequest } from './client'
import type { User } from '@/types'

export interface AuthResponse {
  token?: string
  accessToken?: string
  access_token?: string
  user?: User
}

export function loginApi(payload: { username: string; password: string }) {
  return apiRequest<AuthResponse>(
    '/auth/login',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
    true,
  )
}

export function registerApi(payload: { username: string; password: string }) {
  return apiRequest<AuthResponse>(
    '/auth/register',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
    true,
  )
}

