# API Service Layer & `request<T>` Reference Guide

This document breaks down the central HTTP helper function used in `src/services/api.ts`.

---

## 1. The Code

```ts
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
```

---

## 2. Core Concepts & FAQs

### What is `async`? Is the return type a request?
- **`async`** tells JavaScript: *"This function performs work that takes time (such as talking to a server across the network). Run it in the background and don't freeze the browser UI."*
- The return type is **not** a request. It returns the **data** sent back by the server, wrapped inside a `Promise`.

---

### What does `request<T>` mean?
- `request` is the function's name.
- **`<T>`** is a TypeScript **generic** (a placeholder variable for a type):
  - When called as `request<User>('/users/1')`, `T` becomes `User`.
  - When called as `request<Tickets[]>('/tickets')`, `T` becomes `Tickets[]`.
- It tells TypeScript: *"Whatever data the server returns, type-check it as type `T`."* This gives you full IDE autocomplete and compile-time type safety.

---

### What is `endpoint: string`?
- The URL path on the backend API you want to reach.
- Examples: `'/tickets'`, `'/users'`, `'/categories'`.

---

### What is `options` and `RequestInit`?
- **`options?:`**: An optional parameter (the `?` means you don't have to provide it). If omitted, `fetch()` defaults to a standard HTTP `GET` request.
- **`RequestInit`**: TypeScript's built-in type definition for all settings supported by `fetch()`. It includes:
  - `method?: string` (e.g. `'POST'`, `'PATCH'`, `'DELETE'`)
  - `headers?: HeadersInit`
  - `body?: BodyInit` (e.g. `JSON.stringify(payload)`)
  - `signal?: AbortSignal`

---

### What is `Promise<T>`?
- A **`Promise`** is a receipt for a future value.
- Because network requests are not instantaneous, JavaScript returns a `Promise` immediately. Once the server answers, the promise resolves to the actual value of type `T`.
- Using `await` inside an `async` function unwraps `Promise<T>` directly into `T`.

---

### `response = await fetch(...)` — Does fetch need to succeed to run the next line?
- **`await`** pauses the execution of this specific function until the browser receives the HTTP response headers and status from the server.
- If the network drops or the server is completely unreachable, `fetch` throws a network error immediately, skipping the next lines and jumping straight into the nearest `catch` block.

---

### What parameters does `fetch` take? Are there 3?
`fetch()` takes only **2 parameters**, not 3:
1. **URL string**: The full destination URL (e.g. `'http://localhost:3000/tickets'`).
2. **Options object (optional)**: The configuration object containing method, headers, and body.

---

### Why is the first parameter `${BASE_URL}${endpoint}`?
- This is a JavaScript **template literal** (string interpolation).
- If `BASE_URL` is `'http://localhost:3000'` and `endpoint` is `'/tickets'`, combining them results in `'http://localhost:3000/tickets'`.
- **Why do it this way?** If the backend server URL or port changes in the future, you only need to change `BASE_URL` in one place rather than rewriting full URLs across dozens of functions.

---

### What are `headers`, and is `headers` a type?
- In HTTP, **headers** are key-value metadata sent alongside a request (like the sender address or postage stamp on an envelope).
- In JavaScript code, `headers` is an **object**, e.g. `{ 'Content-Type': 'application/json' }`.
- `'Content-Type': 'application/json'` tells the server: *"The body payload being sent is formatted as JSON."*
- In TypeScript, it is typed as `HeadersInit`.

---

### What do `...options?.headers` and `...options` mean?
- **`...`** is the JavaScript **spread operator**: it copies all properties from one object into another.
- **`?.`** is **optional chaining**: it safely reads properties without crashing if the parent object is `undefined`.
- **`...options?.headers`**: Merges your default headers with any custom headers passed into `options`:
  ```ts
  headers: {
    'Content-Type': 'application/json', // default header
    ...options?.headers,                // extra headers are merged or override defaults
  }
  ```
- **`...options`**: Copies all remaining properties from `options` (like `method: 'POST'` and `body: '...'`) into the options object passed to `fetch()`.

---

### Why check `if (!response.ok)`?
- By default, `fetch()` only throws an error on network connection failures (e.g. DNS failure, offline). It does **not** throw an error for HTTP errors like `404 Not Found` or `500 Internal Server Error`.
- `response.ok` is `true` only for successful status codes (`200` to `299`).
- Checking `if (!response.ok)` and throwing an `Error` ensures that 404s and 500s trigger your components' `catch` blocks so they can show an error banner or retry button.

