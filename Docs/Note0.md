# Project Implementation Roadmap: HelpDesk Frontend

This guide outlines the recommended phase-by-phase order for building the application from scratch. Following this sequence prevents circular dependencies and allows you to test each piece progressively.

---

## Phase 1: Data Contracts & Types (`src/Data/` or `src/types/`)
Define your domain interfaces and union types first. Every component, store, and route depends on these definitions.
- `User.ts`: `Role` (`CLIENT`, `TECHNICIAN`, `ADMIN`), `User` interface.
- `Categories.ts`: `Category` interface (`id`, `name`, `description`).
- `Ticket.ts`: `TicketStatus`, `TicketPriority`, `Ticket` interface.
- `Comment.ts`: `Comment` interface (`id`, `ticketId`, `authorId`, `content`, `isSystem`).

---

## Phase 2: Mock Data Layer (`src/Data/MockData.ts`)
Set up initial mock collections so you can render realistic UI without waiting for an active backend:
- `mockUsers` (at least 1 user per role).
- `mockCategories`.
- `mockTickets` (covering various statuses like OPEN, IN_PROGRESS, RESOLVED, CLOSED).
- `mockComments` (both user comments and system events).

---

## Phase 3: Auth State Management (`src/stores/auth.ts`)
Build the Pinia store managing the active session before setting up router guards:
- State: `currentUser` (or `token`).
- Computed: `isLoggedIn`, `roleHome` (`CLIENT` → `/tickets`, `TECHNICIAN`/`ADMIN` → `/queue`).
- Actions: `login(user)`, `logout()`.

---

## Phase 4: Route Definitions & Skeleton Views (`src/router/index.ts`)
1. Create placeholder `.vue` files in `src/views/` (simple `<div>Page Title</div>`).
2. Map routes to those views with lazy loading (`() => import(...)`).
3. Attach `meta` properties to routes:
   - `public: true` (for `/`, `/login`, `/register`).
   - `roles: ['CLIENT', 'TECHNICIAN', 'ADMIN']` (to specify allowed roles).
4. Add global navigation guards (`router.beforeEach`):
   - Redirect unauthenticated users to `/login`.
   - Prevent authenticated users from visiting public auth pages (redirect to `roleHome`).
   - Block unauthorized roles from visiting restricted routes.

---

## Phase 5: Layout Shell & Shared UI Components (`src/components/`, `src/App.vue`)
Build the frame that wraps the logged-in experience:
- **`AppLayout.vue`**:
  - Sticky top navbar: logo (links to `roleHome`), page title, user menu with logout.
  - Role-filtered sidebar:
    - `CLIENT`: My Tickets, New Ticket.
    - `TECHNICIAN`: Ticket Queue, My Claimed Tickets.
    - `ADMIN`: Ticket Queue, Categories, Users.
- **Shared Badges**:
  - `RoleBadge.vue` (gray, blue, purple).
  - `StatusBadge.vue` (blue, orange, green, gray, red).
  - `PriorityBadge.vue` (gray, yellow, red).
- **Global Modals & Feedback**:
  - `ConfirmModal.vue` (cancel, close, delete actions).
  - `ToastContainer.vue` (success / error popups).
- **`App.vue`**:
  - Render `AppLayout` for authenticated routes; render bare `<RouterView />` for public routes.

---

## Phase 6: Authentication Views
- **`LoginView.vue`**: Form with credentials, error handling, redirect to `roleHome`.
- **`RegisterView.vue`**: Client-side validation, redirect to `/login` upon success.

---

## Phase 7: Feature Views by Role

### 1. Client Pages
- **`MyTicketsView.vue`**: Status tabs, client's own tickets table, row click to detail, ticket cancellation modal for OPEN tickets.
- **`NewTicketView.vue`**: Form with title, category select, description; redirects to ticket detail on submit.

### 2. Staff Pages (Technician & Admin)
- **`TicketQueueView.vue`**: Active/Completed toggle, search box, category/priority/status filters, 6-column queue table, pagination.
- **`ClaimedTicketsView.vue`**: Dedicated view for technicians showing tickets assigned to them.
- **`TicketDetailView.vue`**:
  - Ticket info & metadata header.
  - Discussion timeline (user comments + system events).
  - Comment box (restricted so only assigned technicians can comment).
  - Staff Actions panel: claim ticket, change priority/status/category, admin reassignment.

### 3. Admin Pages
- **`CategoriesView.vue`**: 3-column category grid, ticket count chip, add/edit modal, delete prevention if active tickets exist.
- **`UsersView.vue`**: User search & role filter tabs, user cards, role update dropdown with optimistic update, edit modal.

---

## Phase 8: Public Landing Page (`LandingView.vue`)
Build the public landing page last:
- Sticky navbar with smooth-scroll section links and Log in / Register buttons.
- Hero section with value proposition and CTAs.
- Problem cards, Feature cards, "How it works" timeline, Role summaries, and CTA footer.

---

## Phase 9: Real Backend / API Integration
When connecting to a real server:
- Replace `MockData.ts` calls with a typed HTTP client (`fetch` / `axios`).
- Store real JWT tokens in `localStorage`.
- Add automatic 401 interception to log the user out and redirect to `/login`.

