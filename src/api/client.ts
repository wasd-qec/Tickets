export class ApiError extends Error {
  status: number
  data: unknown

  constructor(message: string, status: number, data?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '')

let unauthorizedHandler: (() => void) | null = null

export function setUnauthorizedHandler(fn: () => void) {
  unauthorizedHandler = fn
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  skipUnauthorizedRedirect = false,
): Promise<T> {
  const token = localStorage.getItem('helpdesk_token')
  const headers = new Headers(options.headers || {})

  if (!headers.has('Content-Type') && options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const response = await fetch(`${BASE_URL}${normalizedPath}`, {
    ...options,
    headers,
  })

  let data: any = null
  const contentType = response.headers.get('content-type') || ''
  if (contentType.includes('application/json')) {
    try {
      data = await response.json()
    } catch {
      data = null
    }
  } else {
    const text = await response.text()
    data = text ? { message: text } : null
  }

  if (response.status === 401 && !skipUnauthorizedRedirect) {
    if (unauthorizedHandler) {
      unauthorizedHandler()
    } else {
      localStorage.removeItem('helpdesk_token')
      localStorage.removeItem('helpdesk_user')
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
  }

  if (!response.ok) {
    const rawMsg =
      data?.message || data?.error || (Array.isArray(data?.errors) ? data.errors[0]?.message : null)
    const msg = Array.isArray(rawMsg) ? rawMsg.join(', ') : rawMsg || `Request failed (${response.status})`
    throw new ApiError(msg, response.status, data)
  }

  return data as T
}

