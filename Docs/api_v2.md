# API Contract (v2)

All endpoints are prefixed with `/api`. Authentication uses `Authorization: Bearer <jwt_token>`.

| Method | Path | Who can call | Request body | Success | Errors |
|---|---|---|---|---|---|
| POST | `/auth/register` | Public (anyone) | `{ name, email, password }` | `201 { user, accessToken }` | `400, 409` |
| POST | `/auth/login` | Public (anyone) | `{ email, password }` | `200 { user, accessToken }` | `400, 401` |
| GET | `/auth/me` | Anyone logged in | — | `200 User` | `401` |
| GET | `/categories` | Anyone logged in | — | `200 Category[]` | `401` |
| POST | `/categories` | Admin | `{ name, description? }` | `201 Category` | `400, 401, 403, 409` |
| PATCH | `/categories/:id` | Admin | `{ name?, description? }` | `200 Category` | `400, 401, 403, 404` |
| DELETE | `/categories/:id` | Admin | — | `204` | `401, 403, 404` |
| GET | `/tickets?page=1&limit=10&status=&categoryId=&search=` | Anyone logged in (Clients see own; Tech/Admin see all) | — | `200 { data: Ticket[], total, page, lastPage }` | `400, 401` |
| GET | `/tickets/:id` | Ticket Owner, Technician, Admin | — | `200 Ticket (includes comments & system activity events visible to Owner/Tech/Admin)` | `401, 403, 404` |
| POST | `/tickets` | Anyone logged in | `{ title, description, priority, categoryId }` | `201 Ticket` | `400, 401, 404` |
| PATCH | `/tickets/:id` | Ticket Owner (title/description/priority if OPEN), Admin | `{ title?, description?, priority?, categoryId? }` | `200 Ticket` | `400, 401, 403, 404` |
| PATCH | `/tickets/:id/status` | Technician, Admin (OPEN/IN_PROGRESS/RESOLVED/CLOSED); Ticket Owner (CANCELLED if OPEN, CLOSED if RESOLVED) | `{ status }` | `200 Ticket (generates isSystem activity comment)` | `400, 401, 403, 404` |
| DELETE | `/tickets/:id` | Admin (hard delete for spam/maintenance) | — | `204` | `401, 403, 404` |
| POST | `/tickets/:id/comments` | Ticket Owner, Technician, Admin (only if ticket not CLOSED or CANCELLED) | `{ content }` | `201 Comment (isSystem: false)` | `400, 401, 403, 404` |
| DELETE | `/comments/:id` | Comment Owner, Admin (user comments only; isSystem comments cannot be deleted) | — | `204` | `400, 401, 403, 404` |

### Error format (all endpoints):
```json
{
  "statusCode": 400,
  "message": ["title should not be empty", "priority must be one of the following values: LOW, MEDIUM, HIGH"],
  "error": "Bad Request"
}
```
