# M1 Frontend Prototype: Step-by-Step Game Plan

A comprehensive guide from scratch to building the complete **HelpDesk** IT ticketing prototype for the Milestone 1 submission.

---

## Architecture Overview & Philosophy

1. **Vite + Vue 3 `<script setup lang="ts">`**: Strict TypeScript, modular composables, scoped styles.
2. **State Separation**:
   - **Global State (Pinia)**: Reserved exclusively for cross-page session state (`auth` store with current logged-in user, role, login/logout).
   - **Local State (`ref` / `computed`)**: Component-level UI state (forms, filters, search, modal toggles, pagination, loading flags).
3. **Async Service Layer**: All HTTP calls flow through `src/services/api.ts` into a mock `json-server` running on `http://localhost:3000` with data stored in `db.json`.

---

## Phase 1: Data Contracts & Mock Database

### 1.1 Type Definitions (`src/Data/`)
Keep data contracts clear and support string/numeric identifiers gracefully:
- **`User.ts`**:
  ```ts
  export type Role = 'CLIENT' | 'TECHNICIAN' | 'ADMIN'
  export interface User {
    id: number | string
    username: string
    password?: string
    role: Role
    createdAt?: string
  }
  ```
- **`Ticket.ts`**:
  ```ts
  export type Stage = 'Opened' | 'In Progress' | 'Resolved' | 'Closed' | 'Cancelled'
  export type Priority = 'Low' | 'Medium' | 'High'
  export interface Tickets {
    id?: number | string
    TicketID: number
    Name: string
    Description?: string
    CreateAt: string
    CreateBy: number | string
    Assignto?: number | string
    UpdatedAt: string
    Stage: Stage
    Priority: Priority
    CategoryID: number
  }
  ```
- **`Categories.ts`**:
  ```ts
  export interface Category {
    id?: number | string
    CategroyID: number
    name: string
    Description?: string
  }
  ```
- **`Comment.ts`**:
  ```ts
  export interface Comment {
    id?: number | string
    CommentID?: number
    TicketID: number | string
    CreateBy?: number | string
    SystemMessage: boolean
    Message: string
    creatAt: string
  }
  ```

### 1.2 Seed Database (`db.json`)
Populate initial records for each collection:
- `users`: Default accounts (`client`, `client2`, `tech`, `tech2`, `admin`) with password `123`.
- `categories`: Hardware, Software, Network, Account & Access.
- `tickets`: Varied statuses (`Opened`, `In Progress`, `Resolved`, `Closed`).
- `comments`: Mix of user comments and system event logs.

---

## Phase 2: Service Layer & Mock API

### 2.1 Install & Script Setup
- Add `json-server` as dev dependency:
  ```powershell
  npm install -D json-server
  ```
- Add script to `package.json`:
  ```json
  "mock-api": "json-server --watch db.json --port 3000"
  ```

### 2.2 Async Service Layer (`src/services/api.ts`)
- Use a central `request<T>(endpoint, options)` wrapper with JSON headers and error handling.
- Add an auto-incrementing sequential index ID generator:
  ```ts
  async function getNextId(endpoint: string): Promise<number> {
    const items = await request<any[]>(endpoint)
    const numericIds = items
      .map(item => Number(item.TicketID ?? item.CommentID ?? item.CategroyID ?? item.id))
      .filter(id => !isNaN(id))
    return numericIds.length > 0 ? Math.max(...numericIds) + 1 : items.length + 1
  }
  ```
- Expose methods: `getTickets`, `getTicketById`, `createTicket`, `updateTicket`, `getCommentsByTicket`, `addComment`, `deleteComment`, `getCategories`, `createCategory`, `updateCategory`, `deleteCategory`, `getUsers`, `createUser`, `updateUser`, `deleteUser`.

---

## Phase 3: Global Auth Store & Navigation Guards

### 3.1 Auth Store (`src/stores/auth.ts`)
- Store `currentUser: ref<User | null>(null)`.
- Computed `isLoggedIn` and role-based `homeRoute`:
  - `CLIENT` -> `/tickets`
  - `TECHNICIAN` / `ADMIN` -> `/queue`
- Async `login(username)` action that verifies the user via `api.getUsers()`.

### 3.2 Router Navigation Guards (`src/router/index.ts`)
- Set `meta: { requiresAuth: true, roles: ['CLIENT', 'TECHNICIAN', 'ADMIN'] }` on routes.
- Use `router.beforeEach`:
  - Redirect unauthenticated users to `/login`.
  - Redirect authenticated users away from `/login` and `/Register` to their `auth.homeRoute`.
  - Enforce role checks (e.g. non-admins blocked from `/categories` and `/user`).

---

## Phase 4: Shared Layout & UI Components

1. **`src/components/AppLayout.vue`**:
   - Top navigation bar showing brand, role badge, navigation links filtered by current user role, and logout button.
   - Main content `<slot />` or `<RouterView />`.
2. **Badge Components**:
   - `StatusBadge.vue`: Color-coded pill (`Opened`=blue, `In Progress`=amber, `Resolved`=green, `Closed`=slate, `Cancelled`=red).
   - `PriorityBadge.vue`: Color-coded pill (`Low`=slate, `Medium`=blue, `High`=red).
   - `RoleBadge.vue`: Tag displaying `CLIENT`, `TECHNICIAN`, or `ADMIN`.
3. **`ConfirmModal.vue`**:
   - Reusable accessible modal dialog with backdrop, confirm/cancel buttons, and optional danger style.
4. **`useToast.ts` Composable**:
   - Lightweight notification banner/toast system for action feedback (success, error).

---

## Phase 5: Authentication Views

### 5.1 `LoginView.vue`
- Clean centered auth card.
- Client-side validation: username and password required.
- Calls `auth.login(username)` asynchronously with loading button state (`"Logging in..."`).
- Displays error alert if invalid and redirects to `auth.homeRoute` on success.

### 5.2 `RegisterView.vue`
- Client-side validation: username min 3 alphanumeric characters, password min 6 characters.
- Asynchronously checks for duplicate username via `api.getUsers()`.
- Creates new `CLIENT` user via `api.createUser(...)` and redirects to `/login?registered=1`.

---

## Phase 6: Client Ticket Flow

### 6.1 `MyTicketsView.vue` (`/tickets`)
- Fetches tickets and categories asynchronously via `api.getTickets()` and `api.getCategories()`.
- Filters tickets by `ticket.CreateBy === auth.currentUser.id`.
- Tab filters: **All**, **Open**, **Resolved / Closed**.
- Visible states: Spinner loading card, error card with retry button, empty state card with "+ New Ticket" button.

### 6.2 `NewTicketView.vue` (`/tickets/new`)
- Dropdown populated with dynamic categories fetched from `api.getCategories()`.
- Priority selector (`Low`, `Medium`, `High`).
- Client-side validation: title required, category required.
- Posts ticket via `api.createTicket(...)` and navigates straight to `/tickets/:id`.

---

## Phase 7: Staff & Ticket Queue Flow

### 7.1 `TicketQueueView.vue` (`/queue`)
- Fetches all tickets, categories, and users asynchronously.
- Toggle between **Active** (`Opened`, `In Progress`) and **Completed** (`Resolved`, `Closed`, `Cancelled`).
- Keyword search across Title and Description.
- Filter dropdowns: Status, Priority, Category with "Reset filters" button.
- Table displaying ID, Title + Author + Category, Priority badge, Status badge, Assigned To, and relative updated time.
- Pagination controls (10 items per page).

### 7.2 `ClaimedTicketsView.vue` (`/claimed_ticket`)
- Filtered queue displaying only tickets where `ticket.Assignto === auth.currentUser.id`.
- Quick tabs for **All Assigned**, **Active**, and **Resolved / Closed**.

---

## Phase 8: Ticket Detail & Discussion Timeline

### `TicketDetailView.vue` (`/tickets/:id`)
1. **Access Control**:
   - If user is `CLIENT` and not the ticket author -> Show **403 Access Denied** card.
   - If ticket doesn't exist -> Show **404 Not Found** card with retry.
2. **Main Details**:
   - Header with ID, badges, author, date, and description box.
3. **Discussion Timeline**:
   - User comments: Avatar circles with initials, username, `RoleBadge`, formatted timestamp, message body.
   - System events: Centered clock icon, event description (e.g. status/assignee changes), timestamp.
   - Admin action: Trash icon allowing admins to delete comments via `ConfirmModal`.
   - Comment input box with loading state; locked banner if ticket is closed/cancelled or technician is unassigned.
4. **Staff Actions Sidebar**:
   - Claim button (for unassigned tickets when viewed by a technician).
   - Reassign dropdown (Admin only).
   - Status, Priority, and Category dropdowns with real-time `api.updateTicket` and automatic system comment logging.
   - Close ticket button triggering `ConfirmModal`.

---

## Phase 9: Admin Management Views

### 9.1 `CategoriesView.vue` (`/categories`)
- Table of categories with usage counter showing how many tickets are assigned to each.
- Add/Edit modal dialog with duplicate name validation.
- Delete action with confirmation modal (safely prevents deleting categories with associated tickets).

### 9.2 `UsersView.vue` (`/user`)
- Table of all user accounts with `RoleBadge`.
- Add/Edit modal to change username and role (`CLIENT`, `TECHNICIAN`, `ADMIN`).
- Delete action preventing users from deleting their own active session.

---

## Phase 10: Verification Checklist for Submission

| Item | Requirement | Verification Method |
| :--- | :--- | :--- |
| **1** | Wireframes | Wireframe images/screens stored in `Docs/` or Figma link |
| **2** | Vite + Vue 3 + TS strict | `npm run build` passes with zero type errors (`vue-tsc --build`) |
| **3** | >= 4 Routes with Params | 10 routes implemented, detail route on `/tickets/:id` |
| **4** | Client-side Form Validation | Validation on Login, Register, New Ticket, Modals |
| **5** | Pinia store + Mock API | `useAuthStore` in `src/stores/auth.ts`, `api.ts` calling `json-server` |
| **6** | Loading, Empty, Error states | Visible spinners, empty notices, and retry error cards in every view |
| **7** | Concept Explanation | Documented difference between Pinia store and component state |

---

## Oral/Written Question Reference
**What state lives in the store and what stays inside a component? Why?**
- **Store (`Pinia`)**: Global cross-route state required by multiple views and router guards simultaneously (e.g. logged-in user session, role permissions). *Why:* Prevents prop-drilling and provides a single source of truth for auth across the application.
- **Component (`ref` / `computed`)**: Ephemeral, local UI state (form inputs, validation errors, search queries, pagination index, modal open/close toggles, request loading indicators). *Why:* Keeps components self-contained, lightweight, and automatically clears when leaving the page.

