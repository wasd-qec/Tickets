import { ref } from 'vue'
import { defineStore } from 'pinia'
import {
  createCategoryApi,
  deleteCategoryApi,
  getCategoriesApi,
  updateCategoryApi,
} from '@/api/categories'
import type { Category } from '@/types'

export const useCategoriesStore = defineStore('categories', () => {
  const categories = ref<Category[]>([])
  const loading = ref(false)

  async function fetchCategories() {
    loading.value = true
    try {
      categories.value = await getCategoriesApi()
      return categories.value
    } finally {
      loading.value = false
    }
  }

  async function createCategory(payload: { name: string; description: string }) {
    const created = await createCategoryApi(payload)
    await fetchCategories()
    return created
  }

  async function updateCategory(
    id: string | number,
    payload: { name: string; description: string },
  ) {
    const updated = await updateCategoryApi(id, payload)
    await fetchCategories()
    return updated
  }

  async function deleteCategory(id: string | number) {
    await deleteCategoryApi(id)
    categories.value = categories.value.filter((c) => String(c.id) !== String(id))
  }

  return {
    categories,
    loading,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  }
})

