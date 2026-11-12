# M1 Frontend Prototype — Remaining Changes Plan

## 1. Fix `ConfirmModal.vue` so Build & ESLint Pass
- **File**: `src/components/ConfirmModal.vue`
- **Issue**: Lines 105–191 contain a duplicated `<template>` and `<style scoped>` block.
- **Change**: Remove the duplicate blocks so `vue-tsc` (strict mode) and ESLint pass with zero errors.

---

## 2. Add a Mock JSON File + Service Layer
- **Requirement**: *"A Pinia store and a service layer calling a mock API (json-server or local JSON)"*
- **Current state**: Views import `mockUsers`, `mockCategories`, `mockTickets`, and `mockComments` directly from `src/Data/MockData.ts`.
- **Changes**:
  1. **`db.json` (or `public/mock-db.json`)**: Export the initial `users`, `categories`, `tickets`, and `comments` datasets as JSON so it can be served by `json-server` (`npx json-server db.json --port 3000`) or fetched as local JSON.
  2. **`src/services/api.ts` (Service Layer)**: Create async service functions (`getTickets`, `getTicketById`, `createTicket`, `updateTicket`, `getCommentsByTicket`, `addComment`, `getCategories`, `createCategory`, `updateCategory`, `deleteCategory`, `getUsers`, `createUser`, `updateUser`, `deleteUser`) that call the mock API (or simulate async requests against the local JSON / in-memory store).
  3. **Pinia Store(s)**: Keep `src/stores/auth.ts` for authentication/session state and optionally add `src/stores/tickets.ts` (or call `src/services/api.ts` from stores/views) so data flows through the service layer instead of direct array imports.

---

## 3. Add Visible Loading, Empty, and Error States
- **Requirement**: *"Loading, empty and error states visible"*
- **Current state**:
  - **Empty state**: Already present in `TicketQueueView.vue`, `MyTicketsView.vue`, `ClaimedTicketsView.vue`, `CategoriesView.vue`, `UsersView.vue`, and `TicketDetailView.vue`.
  - **Error state**: Present in `TicketDetailView.vue` (404 Not Found / 403 Access Denied) and form validation banners, but list views lack a fetch error state with a retry button.
  - **Loading state**: Missing across views because data was read synchronously.
- **Changes**:
  - Add `isLoading` (`ref(false)`) and `errorMessage` (`ref('')`) states to `TicketQueueView.vue`, `MyTicketsView.vue`, `ClaimedTicketsView.vue`, `TicketDetailView.vue`, `CategoriesView.vue`, and `UsersView.vue`.
  - Render a visible loading indicator (`Loading tickets...` / spinner) while the service layer promise is pending, and an error banner with a **Retry** button if the request fails.

---

## 4. Add Wireframes to `Docs/`
- **Requirement**: *"Wireframes (photo or tool) of the main screens in docs/"*
- **Current state**: `Docs/` only contains markdown notes (`Layout.md`, `Note0.md`, `TicketRoute.md`, `confirm.md`, `route_meta.md`).
- **Changes**:
  - Add wireframe images/diagrams of the main screens (Landing/Login, Ticket Queue, My Tickets, New Ticket Form, Ticket Detail, Admin Categories/Users) into `Docs/wireframes/` or `Docs/Wireframes.md`.

---

## 5. Oral / Written Question Answer
**Question**: *What state lives in the store and what stays inside a component? Why?*

- **What lives in the Pinia store (`src/stores/`)**:
  - **Global / cross-route state** that multiple views and the router need simultaneously — such as the logged-in user session, role permissions, and home route (`useAuthStore` in `src/stores/auth.ts`), or shared domain collections fetched via the service layer if cached across pages.
  - **Why**: It avoids prop-drilling through unrelated layout components (`AppLayout`, `RouterView`), keeps navigation guards (`src/router/index.ts`) in sync with login/logout, and gives a single source of truth across pages.
- **What stays inside a component (`ref` / `computed` in `.vue` files)**:
  - **Local UI and ephemeral state** that only matters to that single screen while it is mounted — such as form input fields (`username`, `password`, `title`, `description`), validation error messages, filter/search inputs (`searchQuery`, `statusFilter`, `priorityFilter`), pagination (`currentPage`), modal open/close toggles (`isModalOpen`), and per-request `isLoading` flags.
  - **Why**: Other routes do not care about what a user typed into a search box or whether a delete confirmation modal is open; keeping UI state local makes components self-contained, easier to understand, and automatically resets when leaving the page.

