const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers,
        },
        ...options,
    })

    if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`)
    }

    return response.json()

}
async function getNextId(endpoint: string): Promise<number> {
  const items = await request<any[]>(endpoint)
  const numericIds = items
    .map(item => Number(item.TicketID ?? item.CommentID ?? item.CategroyID ?? item.id))
    .filter(id => !isNaN(id))
  return numericIds.length > 0 ? Math.max(...numericIds) + 1 : items.length + 1
}