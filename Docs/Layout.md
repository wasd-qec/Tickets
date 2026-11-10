# Layout Architecture: Shell & Role-Based Navigation

This document explains the layout shell pattern (`AppLayout.vue`), the role of `<slot />`, and the two ways to handle role-based navigation links.

---

## 1. What is a Layout Shell?

A layout shell acts like a picture frame around your pages:

- **Top Navbar**: Displays brand logo, user identity, and logout action.
- **Left Sidebar**: Displays navigation links appropriate for the active user's role.
- **`<slot />`**: The placeholder where Vue renders the active route view (`<RouterView />`).

```
+-------------------------------------------------------+
|  Top Navbar: [HD HelpDesk]      [Username] [Logout]   |
+-------------+-----------------------------------------+
| Sidebar     | Main Content (<slot />)                 |
| - Link 1    |                                         |
| - Link 2    | (Active page component appears here!)   |
+-------------+-----------------------------------------+
```

---

## 2. Managing Role-Based Links: Two Approaches

### Approach 1: Direct `v-if` in the Template

Conditionally rendering blocks of `<RouterLink>` tags in the template:

```vue
<aside class="sidebar">
  <template v-if="auth.currentUser?.role === 'CLIENT'">
    <RouterLink to="/tickets">My Tickets</RouterLink>
    <RouterLink to="/tickets/new">New Ticket</RouterLink>
  </template>

  <template v-if="auth.currentUser?.role === 'TECHNICIAN'">
    <RouterLink to="/queue">Ticket Queue</RouterLink>
    <RouterLink to="/claimed_ticket">My Claimed Tickets</RouterLink>
  </template>
</aside>
```

- **Pros**: Easy to read for simple templates.
- **Cons**: Duplicates links shared by multiple roles (e.g. `/queue` for both Technician and Admin).

---

### Approach 2: Computed Navigation Array (Recommended)

Defining a `computed` property in `<script setup>` that returns an array of links based on the user's role, then rendering it with a single `v-for`:

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()

const navLinks = computed(() => {
  const role = auth.currentUser?.role

  if (role === 'CLIENT') {
    return [
      { label: 'My Tickets', to: '/tickets' },
      { label: 'New Ticket', to: '/tickets/new' },
    ]
  }
  if (role === 'TECHNICIAN') {
    return [
      { label: 'Ticket Queue', to: '/queue' },
      { label: 'My Claimed Tickets', to: '/claimed_ticket' },
    ]
  }
  if (role === 'ADMIN') {
    return [
      { label: 'Ticket Queue', to: '/queue' },
      { label: 'Categories', to: '/categories' },
      { label: 'Users', to: '/user' },
    ]
  }
  return []
})
</script>

<template>
  <aside class="sidebar">
    <RouterLink
      v-for="link in navLinks"
      :key="link.to"
      :to="link.to"
      class="nav-link"
    >
      {{ link.label }}
    </RouterLink>
  </aside>
</template>
```

- **Pros**: Clean template, no duplication, easy to scale or add icons/badges.

---


## 3. Understanding `:to` and `:key`

`App.vue` conditionally wraps routes with `AppLayout`:

- Public pages (`/`, `/login`, `/register`) render bare without the layout.
- Authenticated pages render inside `<AppLayout>`.
  In the loop:

```html
<RouterLink
  v-for="link in navLinks"
  :key="link.to"
  :to="link.to"
  class="nav-link"
>
  {{ link.label }}
</RouterLink>
```

- **Why is it needed?**: If the user's role changes (e.g. logging out as `CLIENT` and logging in as `ADMIN`), the list of links changes.
  - **Without `:key`**: Vue has to destroy and recreate every DOM element from scratch.
  - **With `:key="link.to"`**: Vue attaches a unique identity tag to each element. It compares the keys and reuses existing elements, only updating or inserting the differences.
- **Rule for `:key`**: It must be a **unique** string or number for each item in the array. Since every route destination path (`/tickets`, `/queue`, etc.) is completely unique, `link.to` makes the ideal key.
