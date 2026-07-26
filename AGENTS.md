<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->
# ServicePro Backend — Repo Conventions

## Stack
- Node.js 22 LTS, Express.js, TypeScript (strict mode)
- MongoDB + Mongoose
- JWT auth (15m access tokens) with rotating refresh tokens (30d, hashed
  SHA-256 in-db, replay-protected — reuse of a rotated token revokes all
  sessions and bumps the user's tokenVersion)
- Zod for request + environment validation (env config is Zod-validated at
  boot; the app refuses to start with missing/invalid keys)
- Socket.io (architecture only for now — no live features yet)
- S3-compatible client for uploads (env-driven config, not hardcoded provider)
- Swagger/OpenAPI via swagger-jsdoc + swagger-ui-express, served at /api-docs

## Architecture rule: screen-driven, not CRUD-driven
Every admin screen has ONE primary GET endpoint that returns everything
needed to render that screen (cards, lists, filters, counts, pagination) in
a single response. Internally, aggregate across collections with Mongoose
aggregation pipelines, or by composing other modules' public service
methods — the frontend never makes 8-10 calls to build one page.

Every module still exposes the expected verbs where applicable:
GET (load screen) / POST (create) / PUT|PATCH (update) / DELETE / any
module-specific actions (approve, reject, refund, etc.)

## Layering (strict — do not collapse these)
`routes -> controller -> service -> repository -> Mongoose model`
- Controllers: parse request, call service, shape HTTP response. No business
  logic, no raw Mongo/Mongoose error handling — throw a typed `ApiError` and
  let the centralized error-handling middleware format the response.
- Services: business logic, orchestration, aggregation composition.
- Repositories: the only layer that talks to Mongoose/MongoDB directly.
- Zod schemas live in `src/validators/<module>.validator.ts`, used as
  middleware.

## Folder structure
```
backend/
  src/
    config/          # env (Zod-validated), db connection, s3 client
    middleware/       # auth, error handler, validate(zod), rbac, rate-limit
    modules/
      <module>/
        <module>.model.ts
        <module>.repository.ts
        <module>.service.ts
        <module>.controller.ts
        <module>.routes.ts
        <module>.validator.ts
    utils/
    types/
    routes.ts          # mounts all module routers under /api/v1
    app.ts
    server.ts
  docs/
    openapi/            # swagger source or generated spec
  tests/
    <module>/
```

## Cross-cutting requirements for every module
- Pagination: `?page=&limit=` with `{ data, meta: { page, limit, total, totalPages } }`
- Filtering/search/sort via query params, documented in Swagger
- RBAC via middleware (`requireRole('customer' | 'technician' | 'admin' | 'super_admin')`)
- Ownership scoping where relevant (customers see only their own bookings;
  technicians see only their assigned tickets)
- Centralized error handler; controllers never `try/catch` raw Mongo errors
- Every route documented with a swagger-jsdoc block above it
- Every module ships with at least a happy-path integration test hitting its
  primary GET endpoint, using the Node.js native test runner + supertest
  against an in-memory Mongo instance (mongodb-memory-server)
- No module reaches into another module's repository directly — only through
  its service's public methods

## Security baseline (already established — keep intact in every module)
- Passwords: bcrypt, 12 salt rounds, strong-password Zod rules (min 10 chars,
  upper/lower/number)
- express-mongo-sanitize strips `$`/`.` operators from client input (NoSQL
  injection prevention)
- helmet enabled; hpp configured against parameter pollution
- Rate limiting: strict global limiter + a stricter auth-specific limiter
- `.env` never committed; all secrets loaded via the Zod-validated config
  module
- Any newly stored secrets (API keys, payment gateway credentials, etc.)
  must be encrypted at rest and never returned in plaintext on a GET

## File Management (centralized)
All uploads — technician documents/certificates/CNIC/selfies, customer issue
photos, booking before/after images, review images, admin avatars, CMS
banners — go through one `files` module, not ad-hoc per-module upload code.
- `POST /files` accepts multipart upload, stores to the S3-compatible bucket,
  returns `{ fileId, url, mimeType, size }`.
- Other modules store the returned `fileId`/`url` on their own documents —
  they never touch the S3 client directly.
- Validate mime type + size server-side per upload "purpose" (e.g. avatars
  capped smaller than certificates).

## Audit Logs
Sensitive admin actions get an audit entry: admin login, technician
approved/rejected, booking reassigned/cancelled/refunded, service updated,
user suspended, settings changed.
- Implement as a lightweight service: `auditLog.record({ actor, action,
  targetType, targetId, meta })`, called from within the relevant service
  layer (never from controllers directly).
- `GET /admin/audit-logs` (admin/super_admin only) — paginated, filterable
  by actor, action type, date range.

## Notifications
- Internal `notificationService.send({ userId, type, channel, template, data })`
  used by other modules (technician approved, booking status change, new
  support message, etc.) instead of each module rolling its own email/push
  code.
- Persisted notification record + delivery log per channel (push/email/sms).
- `GET /admin/notifications` — screen-driven: recent activity, unread count,
  templates list. `PATCH /admin/notifications/:id/read`,
  `POST /admin/notifications/broadcast`.
- Templates stored in DB (module: notification-templates) so admins can edit
  copy without a deploy.

## Extending vs. forking existing modules
New/incomplete screens (Customers completion, Booking Management
Enhancements, Dashboard, Reports, etc.) build on the existing `/auth`,
`/users`, `/services`, `/bookings`, `/technicians`, `/reviews`, `/payments`,
`/support`, and `/admin/stats` modules already in the repo. Extend those
services/repositories — never create a parallel collection or duplicate
aggregation logic for something that already has a source of truth.

## Definition of done for ANY task in this repo
1. `npm run build` passes (no TS errors)
2. `npm run lint` passes
3. `npm test` passes, including new tests for this module
4. New endpoints appear in Swagger UI at `/api-docs`
5. No module reaches into another module's repository directly — only through
   its service's public methods
6. Sensitive actions call `auditLog.record(...)`; user-facing status changes
   call `notificationService.send(...)` where applicable
