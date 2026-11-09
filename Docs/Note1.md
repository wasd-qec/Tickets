# HelpDesk Frontend Concepts & Notes

## 1. TypeScript Types & Interfaces

- **`type`**: Best for unions and fixed sets of values (e.g., status, role).
- **`interface`**: Best for defining the shape of an object (e.g., `User`, `Ticket`).
- **`?` (Optional property)**: Indicates a property is not required and can be `undefined`.

```ts
// Fixed set of role values
export type Role = 'CLIENT' | 'TECHNICIAN' | 'ADMIN'

// Object shape with an optional property
export interface User {
  id: number
  username: string
  role: Role
  createdAt?: string // Optional property
}
```

---

## 2. Relational Data Modeling (IDs vs. Objects)

- **Database-ready design**: Persisted records store foreign keys as numeric IDs (e.g., `createdBy: number`, `categoryId: number`).
- **Frontend convenience**: When APIs populate related models, the interface often supports both the ID and the optional hydrated object.

```ts
export interface Ticket {
  id: number
  title: string
  categoryId: number    // Foreign key ID
  category?: Category   // Hydrated object for easy template display (ticket.category?.name)
  authorId: number
  author?: User
}
```

---

## 3. Path Aliasing (`@`)

- **`@`** is a shortcut configured in Vite and TypeScript that maps directly to the `src` folder.
- Avoids fragile relative paths (e.g., `import ... from '@/Data/User'` instead of `../../Data/User`).

---

## 4. Pinia Auth Store

A store manages global state using three core parts:
1. **State (`ref`)**: Holds reactive data (e.g., `currentUser`, `token`).
2. **Computed / Getters (`computed`)**: Derived values (e.g., `isLoggedIn`, `homeRoute`).
3. **Actions (`function`)**: Methods that mutate the state.

```ts
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { User } from '@/Data/User'

export const useAuthStore = defineStore('auth', () => {
  // 1. State
  const currentUser = ref<User | null>(null)

  // 2. Computed
  const isLoggedIn = computed(() => currentUser.value !== null)

  const homeRoute = computed(() => {
    if (currentUser.value?.role === 'TECHNICIAN' || currentUser.value?.role === 'ADMIN') {
      return '/queue'
    }
    return '/tickets'
  })

  // 3. Actions
  function setUser(user: User) {
    currentUser.value = user
  }

  function clearUser() {
    currentUser.value = null
  }

  return { currentUser, isLoggedIn, homeRoute, setUser, clearUser }
})
```

### Future Backend Evolution (`isLoggedIn`)
When a real backend API is added:
- Store a JWT token (`const token = ref<string | null>(localStorage.getItem('token'))`).
- `isLoggedIn` checks whether the token exists (`computed(() => !!token.value)`).

---

## 5. Vue Router & Home Route Concept

- **`homeRoute`**: Resolves which page a user lands on after logging in, clicking the brand logo, or hitting an unauthorized page:
  - `CLIENT` → `/tickets`
  - `TECHNICIAN` / `ADMIN` → `/queue`
- **`src/router/index.ts`**:
  - Configures history mode (`createWebHistory`).
  - Maps URL paths to Vue view components (`routes: []`).
  - Implements **Navigation Guards** (`router.beforeEach`) to protect routes and redirect based on login status and role.

