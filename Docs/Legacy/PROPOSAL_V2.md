# HelpDesk — IT Support & Ticketing System

Name: Rith Chankolboth ID: p20240038

## Problem

Small organizations and university departments often track technical support requests through scattered informal messages or in-person complaints, causing issues to be forgotten and leaving users in the dark about repair progress. A centralized ticketing portal ensures every technical issue is categorized, assigned to staff, and tracked from submission to resolution with clear accountability.

## Users and roles

- **Client**: Registers an account with a username and password, submits support tickets under specific categories, views their own tickets, cancels open tickets if no longer needed, closes confirmed resolved tickets, and posts follow-up comments.
- **Technician**: Views all submitted tickets across the system queue (prioritizing active tickets over resolved/closed), claims tickets (recording their technician ID), assesses/sets priority levels, updates ticket statuses (Open, In Progress, Resolved, Closed), and posts troubleshooting replies.
- **Admin**: Manages ticket categories (Hardware, Software, Network, Account), oversees all tickets and comments (with hard-delete authority for maintenance and spam moderation), closes inactive resolved tickets, and updates user roles.

## User stories

### Client Role

1. As a Client, I want to register an account and log in with my username and password so that I can securely access the support portal.
   Accepted when: Client and server validate that the username is alphanumeric (min 3 chars) and password is at least 6 characters; duplicate usernames are rejected with HTTP 400 Bad Request; password is securely hashed with bcrypt in PostgreSQL; logging in returns a signed JWT.
2. As a Client, I want to create a support ticket with a title, description, and category so that IT staff have the details needed to help me.
   Accepted when: Form validates that required fields are not empty; priority automatically defaults to "MEDIUM" and status defaults to "OPEN"; API creates the ticket linked to the logged-in user ID and selected category ID; returns HTTP 201 Created.
3. As a Client, I want to view my open tickets and cancel a ticket while it is still open if I solve the problem myself or no longer need help.
   Accepted when: Client dashboard displays only tickets owned by that user; a Client can cancel a ticket only while its status is "OPEN"; cancelling updates ticket status to "CANCELLED" instead of hard deleting, preserving full audit history and activity comments; attempting to cancel another user's ticket returns HTTP 403 Forbidden; attempting to cancel an "IN_PROGRESS", "RESOLVED", or "CLOSED" ticket returns HTTP 400 Bad Request.
4. As a Client, I want to post follow-up comments on my ticket and read technician replies and system activity events so that we can communicate back and forth about troubleshooting steps without altering the original ticket.
   Accepted when: Comment is saved with author ID and timestamp; regular comments and system activity events (`isSystem: true`) are visible to the Ticket Owner (Client), Technicians, and Admins; system events provide an immutable audit trail (cannot be edited or deleted by anyone); attempting to post a comment on a "CLOSED" or "CANCELLED" ticket returns HTTP 400 Bad Request (ticket is archived and locked).
5. As a Client (or Technician/Admin), I want to close a resolved ticket so that the issue is formally verified, archived, and locked from further changes.
   Accepted when: Clicking "Close Ticket" is allowed only on tickets currently in "RESOLVED" status; can be closed by the ticket owner (Client) to confirm resolution, or by a Technician/Admin as an administrative close if the client is unresponsive; changes status to "CLOSED", records `closedAt` timestamp, and permanently locks the ticket from new comments; attempting to close a ticket in "OPEN" or "IN_PROGRESS" returns HTTP 400 Bad Request; non-owners/non-staff receive HTTP 403 Forbidden.

### Technician Role

6. As a Technician, I want to view a queue of all tickets and filter or search them by status, priority, or keyword so that I can prioritize active work and review completed tickets.
   Accepted when: Technician dashboard loads paginated tickets (10 per page); default queue view displays active tickets ("OPEN", "IN_PROGRESS"); filter controls allow viewing completed tickets ("RESOLVED", "CLOSED", "CANCELLED"); search query parameters return matching records from the API.
7. As a Technician, I want to claim a ticket, assess its priority level, and update its status between "OPEN", "IN_PROGRESS", and "RESOLVED" so that my actions and resolution progress are tracked.
   Accepted when: Only users with Technician or Admin roles can update status, priority, or assignment; regular Clients receive HTTP 403 Forbidden; claiming or updating records the technician's ID, updates the `updatedAt` timestamp, and automatically generates an activity event in the ticket discussion thread with `isSystem: true` (e.g., "[Activity] Technician Alex updated status to RESOLVED"); system activity events are visible to the Ticket Owner, Technicians, and Admins to provide full transparency on ticket lifecycle changes.
8. As a Technician, I want to post troubleshooting replies and progress notes on any ticket so that the Client knows what actions are being taken.
   Accepted when: Technician comments are saved with author ID and displayed with a "Technician" role badge in the discussion timeline; comments cannot be added to tickets in "CLOSED" or "CANCELLED" status (HTTP 400 Bad Request).

### Admin Role

9. As an Admin, I want to create, update, and delete ticket categories (e.g., "Network", "Hardware") so that tickets stay properly organized.
   Accepted when: Admin portal provides CRUD controls for categories; deleting a category with active tickets is prevented with HTTP 400 Bad Request; non-admins receive HTTP 403 Forbidden.
10. As an Admin, I want to view all registered users and change a user's role between Client, Technician, and Admin so that staff permissions are properly managed.
    Accepted when: Admin user table lists all users; role update endpoint changes user role in PostgreSQL; non-admins receive HTTP 403 Forbidden.

## MVP scope

- **Must have**: Story 1, Story 2, Story 3, Story 4, Story 6, Story 7, Story 8, Story 9, Story 10
- **Nice to have**: Story 5

### Which story did you cut from the MVP, and why?

I placed **Story 5 (Closing a resolved ticket to locked CLOSED status)** in the "Nice to have" scope rather than "Must have". The core ticketing resolution loop is functionally complete once Technicians transition tickets to "RESOLVED" (Story 7), which immediately clears tickets from the active technician queue and delivers the solution to the client; formal client verification and locking tickets to "CLOSED" (Story 5) adds valuable lifecycle polish and read-only archival, but is not blocking for the core MVP demo. In Story 3, ticket cancellation transitions tickets to "CANCELLED" rather than hard-deleting records, ensuring full audit history and activity logs remain intact while Admins retain hard delete for moderation. 

## Entities

| Entity   | Main attributes                                                                                                                                                                                         | Relations                                                                                               |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| User     | id, username (unique), passwordHash, role (CLIENT, TECHNICIAN, ADMIN), createdAt                                                                                                                        | has many Tickets (as author), has many Tickets (as assigned technician), has many Comments (as author)  |
| Category | id, name (unique), description                                                                                                                                                                          | has many Tickets                                                                                        |
| Ticket   | id, title, description, status (OPEN, IN_PROGRESS, RESOLVED, CLOSED, CANCELLED), priority (LOW, MEDIUM, HIGH), categoryId, authorId, assignedToId (optional), closedAt (optional), createdAt, updatedAt | belongs to User (author), belongs to User (assigned technician), belongs to Category, has many Comments |
| Comment  | id, content, isSystem (boolean), ticketId, authorId (optional for system events), createdAt                                                                                                             | belongs to Ticket, belongs to User (author)                                                             |

*Note on Comment visibility & system events:*

- Regular comments (`isSystem: false`) and automated activity events (`isSystem: true`) are visible to all users who have access to the ticket: the **Ticket Owner (Client)**, **Technicians**, and **Admins**.
- System activity events are generated automatically by the backend upon lifecycle actions (e.g., ticket claimed, status changed, priority updated). They are **immutable** audit records and cannot be edited or deleted by any user (including Admins).
- Regular user comments can be deleted only by their author or an Admin.

## Stretch feature

**Chosen feature**: Search + pagination

**What it does in this app**:
Users and Technicians can search tickets by keyword in the title/description, filter tickets by status (Open, In Progress, Resolved, Closed, Cancelled), priority (Low, Medium, High), or category, and browse through the results 10 items per page.

## Tech stack

- **Frontend**: Vue 3 (Composition API with `<script setup>`), TypeScript, Vite, Vue Router (navigation & role guards), Pinia (global auth & ticket state)
- **Backend**: NestJS, TypeScript, REST API architecture (Modules, Controllers, Services, DTOs with `class-validator`), Swagger / OpenAPI documentation
- **Database & ORM**: PostgreSQL 16 (relational database), Prisma ORM (data modeling, schema migrations, seed scripts)
- **Authentication & Security**: JWT (JSON Web Tokens), `bcrypt` password hashing, Role-based authorization (`CLIENT`, `TECHNICIAN`, `ADMIN`), Resource ownership verification
- **DevOps & Tooling**: Docker & Docker Compose (containerized PostgreSQL and web/api services), GitHub Actions (CI pipeline for lint, test, build), Jest & Supertest (automated testing)

## Repository

https://github.com/<your-username></your>/helpdesk-lite
