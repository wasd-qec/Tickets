import { mockDb } from '@/data/mockData'
import type { Category } from '@/types'

export async function getCategoriesApi(): Promise<Category[]> {
  return mockDb.getCategories()
}

export async function createCategoryApi(payload: {
  name: string
  description: string
}): Promise<Category> {
  const categories = mockDb.getCategories()
  const newCat: Category = {
    id: Date.now(),
    name: payload.name,
    description: payload.description,
    ticketCount: 0,
  }
  categories.push(newCat)
  mockDb.saveCategories(categories)
  return newCat
}

export async function updateCategoryApi(
  id: string | number,
  payload: { name: string; description: string },
): Promise<Category> {
  const categories = mockDb.getCategories()
  const idx = categories.findIndex((c) => String(c.id) === String(id))
  if (idx === -1) {
    throw new Error('Category not found')
  }
  const updated: Category = {
    ...categories[idx]!,
    name: payload.name,
    description: payload.description,
  }
  categories[idx] = updated
  mockDb.saveCategories(categories)
  return updated
}

export async function deleteCategoryApi(id: string | number): Promise<void> {
  const categories = mockDb.getCategories()
  const cat = categories.find((c) => String(c.id) === String(id))
  if (!cat) return

  if ((cat.ticketCount ?? 0) > 0) {
    const error: any = new Error('Cannot delete a category with active tickets')
    error.status = 400
    throw error
  }

  const filtered = categories.filter((c) => String(c.id) !== String(id))
  mockDb.saveCategories(filtered)
}
