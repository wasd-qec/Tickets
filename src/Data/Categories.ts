export interface Category {
  id: number
  name: string
  description?: string
  _count?: {
    tickets?: number
  }
}
