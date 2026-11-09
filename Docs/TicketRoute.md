# Routing Architecture: Shared Detail vs. Separate List Routes

This document explains the architectural rationale behind using a single shared route for ticket details (`/tickets/:id`) while maintaining separate routes for ticket lists (`/tickets` vs. `/my-claims`).

---

## 1. Single Shared Route for Detail Views (`/tickets/:id`)

Both Clients and Staff (Technicians/Admins) use the same route: `/tickets/:id`.

### A. Canonical URLs & Permalinks
- A ticket ID represents a specific entity in the system.
- When an email notification, Slack ping, or direct message links to ticket `#101`, the link must resolve to `https://app.com/tickets/101`.
- If routes were split by role (e.g., `/client/tickets/101` vs. `/staff/tickets/101`), opening a shared link would break whenever accessed across roles.

### B. UI Adaptation via Permissions
Instead of splitting routes, the single component (`TicketDetailView.vue`) adapts its UI controls based on the logged-in user's role:
- Core content (Title, description, timeline) is visible to all permitted viewers.
- Role-specific elements (e.g., the "Staff Actions" panel) use conditional rendering (`v-if="isStaff"`).

---

## 2. Separate Routes for List Views (`/tickets` vs. `/my-claims`)

Clients view their tickets at `/tickets`, while Technicians view their claimed tasks at `/my-claims` (or `/queue/mine`).

### A. Different Query Semantics & Perspectives
- **Client List (`/tickets`)**: Represents *"Issues I authored"* (`createdBy === currentUserId`).
- **Technician List (`/my-claims`)**: Represents *"Work assigned to me to fix"* (`assignedTo === currentUserId`).

### B. Handling Role Overlap (Technician as an Employee)
In real-world organizations, technicians are also company employees:
- If a technician's office hardware breaks, they submit a support ticket as an **author**.
- At the same time, they have 10 open tickets to resolve as an **assignee**.
- If both lists shared `/tickets`, the app could not distinguish whether the technician wanted to check on their broken hardware or their daily workload. Separate routes make user intent explicit.

### C. Predictable Navigation & Bookmarks
- Browser history, Back button behavior, and browser bookmarks remain clear.
- A technician bookmarking `/my-claims` always returns to their work queue, without depending on ambiguous session checks.

---

## 3. Summary Rule of Thumb

| View Type | Route Pattern | Approach | Reason |
| :--- | :--- | :--- | :--- |
| **Singular Resource** | `/tickets/:id` | **Shared Route** | Canonical identity, sharable permalinks, role-adapted UI controls (`v-if`). |
| **Filtered Collection** | `/tickets` vs. `/my-claims` | **Separate Routes** | Different query filters, distinct user intents, unambiguous navigation. |

