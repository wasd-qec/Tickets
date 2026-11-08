# Milestone Design Answers (v2)

## M0 Proposal (Week 3)

**Question: Which story did you cut from the MVP, and why?**  
I placed **Story 5 (Closing a resolved ticket to locked CLOSED status)** in the "Nice to have" scope rather than "Must have". The core ticketing resolution loop is functionally complete once Technicians transition tickets to "RESOLVED" (Story 7), which immediately clears tickets from the active technician queue and delivers the solution to the client; formal verification and locking tickets to "CLOSED" (Story 5) adds extra lifecycle polish and read-only archival, but is not blocking for the core MVP demo. In Story 3, ticket cancellation transitions tickets to "CANCELLED" rather than hard-deleting records, ensuring full audit history and activity logs remain intact while Admins retain hard delete for moderation. Story 10 (Admin user role management UI) is kept in the core MVP to guarantee administrators have an in-app management interface for user access control and staff onboarding from the start. Cutting Story 5 minimizes initial frontend and state-machine surface area, keeping the initial MVP delivery focused on robust authentication, ticket CRUD operations, category management, role administration, and the commenting thread between clients and technicians.

---

## M1 Frontend Prototype (Week 5)
**Question: What state lives in the store and what stays inside a component? Why?**
* **Lives in the Pinia store (`authStore` and `ticketStore`):** The currently logged-in user's profile, JWT token, and role live in `authStore` because almost every component and Vue Router guard needs to know if the user is authenticated and what permissions they have. Shared lists of categories and cached tickets live in `ticketStore` so navigating between the list view and detail view doesn't lose filter state.
* **Stays inside a component (`ref` / `reactive`):** Temporary UI state such as form input fields (while typing a new ticket title or comment), validation error messages, dropdown open/close toggles, and local loading spinners stay inside the individual Vue component. No other page cares about half-typed form text, so keeping it local makes components simpler and prevents unnecessary global state clutter.

---

## M2 Backend API (Week 7)
**Question: Why did you choose this relation (1-N or N-N) between two of your entities?**
I chose a **one-to-many (1-N)** relation between `Category` and `Ticket` (one Category has many Tickets, and each Ticket belongs to exactly one Category via a `categoryId` foreign key). In an IT helpdesk workflow, forcing a ticket into a single primary category (such as "Hardware" or "Network") makes it unambiguous which support queue owns the issue and keeps SQL queries and Prisma filters straightforward without needing an intermediate join table. Similarly, `Ticket` to `Comment` is a 1-N relation because every comment belongs to one specific support thread, and deleting a ticket cascades to clean up its comments.

---

## M3 Integrated App (Week 9)
**Question: Where is the token stored in the browser, and what attack does that choice protect against or expose?**
The JWT is stored in **`localStorage`** (and loaded into the Pinia `authStore` on app initialization) and sent in the `Authorization: Bearer <token>` HTTP header on API requests.
* **What it protects against:** Because browsers do not automatically attach `localStorage` values to cross-site requests, this protects against **CSRF (Cross-Site Request Forgery)** attacks.
* **What it exposes:** `localStorage` is accessible via JavaScript, which means if the app has an **XSS (Cross-Site Scripting)** vulnerability, malicious injected scripts could read the token. To mitigate XSS, Vue 3 automatically escapes rendered HTML templates (`{{ }}`), we never use `v-html` on user-submitted ticket descriptions or comments, and the NestJS backend validates and sanitizes all incoming DTOs.

---

## M4 Feature Complete (Week 12)
**Question: Pick one test. What bug would it catch?**
In `tickets.e2e-spec.ts`, the test `PATCH /tickets/:id returns 403 Forbidden when Client B tries to update Client A's ticket` verifies ownership authorization. If a developer accidentally removes the ownership check in `TicketsService` or modifies the guard so it only checks whether a user is logged in (`JwtAuthGuard`) without checking `ticket.authorId === currentUser.id`, any logged-in student could edit, close, or cancel someone else's support tickets. This e2e test immediately catches that authorization regression before deployment.

---

## M5 Deployed (Week 14)
**Question: What happens, step by step, between `git push` and your change being live?**
1. A developer runs `git push origin main` to push new commits to GitHub.
2. GitHub triggers the **GitHub Actions CI workflow** defined in `.github/workflows/ci.yml`.
3. The CI runner spins up a clean Ubuntu container with a PostgreSQL service container, installs dependencies (`npm ci`), and runs **ESLint** to check code formatting and TypeScript types on both `web/` and `api/`.
4. The CI runner applies Prisma migrations (`npx prisma migrate deploy`) and runs all **Jest unit tests and Supertest e2e tests**.
5. The CI runner executes `npm run build` for both the Vue frontend (via Vite) and the NestJS backend to verify production bundles compile without errors.
6. Once CI passes green, on the deployment server (or local production host), `docker compose up -d --build` pulls the latest code, builds the multi-stage Docker images (`web` served by Nginx and `api` running Node/NestJS), applies database migrations, and restarts the containers behind Nginx.
