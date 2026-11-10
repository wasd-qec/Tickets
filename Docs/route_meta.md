# Typing Route Meta in Vue Router with TypeScript

This document explains how to properly type Vue Router's `meta` field using Declaration Merging, and why `roles` must be formatted as an array.

---

## 1. The Problem: The "Unlabeled Cardboard Box"

In plain JavaScript, you can use `meta` directly with zero setup:

```js
// In pure JavaScript (no TypeScript): runs completely fine!
if (to.meta.roles && to.meta.roles.includes('ADMIN')) {
  // ...
}
```

However, **TypeScript** is strict. Think of `to.meta` as an **unlabeled cardboard box**:
- Vue Router told TypeScript: *"Hey, `meta` is just an empty box. The developer can throw anything they want inside it."*
- Because TypeScript doesn't know what you plan to put in that box, it treats the contents as a complete mystery (**`unknown`**).

When you write:
```ts
to.meta.roles.includes('ADMIN')
```
TypeScript stops you and says:
> *"Wait! I don't know what is inside this box. What if `roles` isn't a list? What if it's a number, or undefined? You can't call `.includes()` on something I don't recognize."*

---

## 2. The Solution: Declaration Merging (Sticking a Label on the Box)

**Declaration Merging** is simply you sticking a clear label on that box so TypeScript knows what's inside.

In TypeScript, interfaces with identical names across files automatically merge together. You can extend Vue Router's internal `RouteMeta` interface by declaring your own fields:

```ts
import type { Role } from '@/Data/User'

declare module 'vue-router' {
  interface RouteMeta {
    public?: boolean
    roles?: Role[]
  }
}
```

You are telling TypeScript:
> *"Inside Vue Router's `meta` box, there will only be two items: an optional boolean called `public`, and an optional array of roles called `roles`."*

TypeScript reads your label, updates its memory, and from that moment on:
- It knows `to.meta.roles` is an array.
- It happily allows you to call `.includes(...)`.
- If you misspell a role name (like `'ADMN'`), it catches the typo immediately.

---

## 3. Why `roles` Must Be an Array (`Role[]`)

In the interface above, `roles` is typed as `Role[]` (an array of `Role` values).

### ❌ The Error: Passing a Single String
If you assign a single string directly:

```ts
{
  path: '/tickets',
  component: () => import('@/views/MyTicketsView.vue'),
  meta: { roles: 'CLIENT' } // ❌ Error: Type 'string' is not assignable to type 'Role[]'
}
```

TypeScript flags this because a single string (`'CLIENT'`) is not an array (`['CLIENT']`).

### ✅ The Fix: Wrap in Brackets
Wrap the role in an array:

```ts
{
  path: '/tickets',
  component: () => import('@/views/MyTicketsView.vue'),
  meta: { roles: ['CLIENT'] } // ✅ Correct: matches Role[]
}
```

Even if a route only allows one role, it must still be an array so that:
1. It matches the `Role[]` type definition.
2. The navigation guard can always call `.includes(...)` uniformly, regardless of whether a route allows one role or multiple roles.

---

## 4. Complete Example in `src/router/index.ts`

```ts
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import type { Role } from '@/Data/User'

// 1. Extend Vue Router's RouteMeta interface
declare module 'vue-router' {
  interface RouteMeta {
    public?: boolean
    roles?: Role[]
  }
}

// 2. Define routes using typed meta
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { public: true },
    },
    {
      path: '/tickets',
      name: 'tickets',
      component: () => import('@/views/MyTicketsView.vue'),
      meta: { roles: ['CLIENT'] },
    },
    {
      path: '/queue',
      name: 'queue',
      component: () => import('@/views/TicketQueueView.vue'),
      meta: { roles: ['ADMIN', 'TECHNICIAN'] },
    },
  ],
})

// 3. Navigation guard with full type safety
router.beforeEach((to) => {
  const auth = useAuthStore()

  if (to.meta.public) {
    if (auth.isLoggedIn) return auth.homeRoute
    return true
  }

  if (!auth.isLoggedIn) {
    return '/login'
  }

  const allowedRoles = to.meta.roles // Typed as Role[] | undefined
  if (allowedRoles && auth.currentUser && !allowedRoles.includes(auth.currentUser.role)) {
    return auth.homeRoute
  }

  return true
})

export default router
```

