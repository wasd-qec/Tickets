import { apiRequest } from './client'
import type { Category } from '@/types'

export async function getCategoriesApi(): Promise<Category[]> {
  const res = await apiRequest<any>('/categories')
  if (Array.isArray(res)) return res
  return res?.categories || res?.items || res?.data || []
}

export async function createCategoryApi(payload: {
  name: string
  description: string
}): Promise<Category> {
  const res = await apiRequest<any>('/categories', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return res?.category || res?.data || res
}

export async function updateCategoryApi(
  id: string | number,
  payload: { name: string; description: string },
): Promise<Category> {
  const res = await apiRequest<any>(`/categories/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
  return res?.category || res?.data || res
}

export async function deleteCategoryApi(id: string | number): Promise<void> {
  await apiRequest<void>(`/categories/${id}`, {
    method: 'DELETE',
  })
}

