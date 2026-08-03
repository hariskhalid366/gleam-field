# ServicePro API

Standalone backend for the ServicePro Field Service Management platform.

**Stack:** Node.js 22 LTS · Express · TypeScript · MongoDB + Mongoose · JWT with rotating refresh tokens · bcrypt · Zod · Winston · Socket.IO (structure) · Swagger · Docker · dotenv.

> This service is independent of the frontend in this repo — the React app currently runs on static data. Point it at the API by setting the frontend's API base URL to `http://localhost:4000/api/v1`.

## Run locally

```bash
cd backend
cp .env.example .env      # then set real 64-char JWT secrets
npm install
npm run dev               # http://localhost:4000/api/v1
```

Docker (API + MongoDB):

```bash
cp .env.example .env
docker compose up --build
```

API docs: `http://localhost:4000/docs` · OpenAPI JSON: `/docs.json`

## Production deployment (Ubuntu VPS + Docker)

The production Compose file runs only the API. Use MongoDB Atlas or another managed MongoDB service; do not expose a database port from this server. Uploaded files and logs are kept in Docker volumes, so they survive container replacements.

```bash
# On the server, from the backend directory
cp .env.production.example .env
nano .env                         # set MongoDB URI, two new JWT secrets, and CORS_ORIGINS
docker compose -f docker-compose.production.yml up -d --build
curl http://127.0.0.1:4000/api/v1/health
```

Configure Nginx with `deploy/nginx-api.conf.example`, replacing `api.example.com`, then issue TLS with Certbot. Point the frontend build to `VITE_API_BASE_URL=https://api.example.com/api/v1` and rebuild/redeploy the frontend.

Before going live, add the server's IP to the MongoDB network allowlist and rotate any database password or JWT secret that was previously shared. Verify the public endpoint after TLS is enabled:

```bash
curl https://api.example.com/api/v1/health
```

## Layout

```
src/
  config/      env (Zod-validated), db, logger (Winston), swagger
  models/      user, refreshToken, technician, booking, service, review
  middleware/  auth (JWT + role gate), validate (Zod), error, rateLimit
  modules/     auth, services, technicians, bookings, reviews
  sockets/      Socket.IO server, JWT handshake, rooms + events
  utils/       token, ApiError, catchAsync, response
  app.ts       Express app + security middleware
  server.ts    HTTP server, Socket.IO, graceful shutdown
```

## Security model

- **Passwords**: bcrypt (12 rounds), `select: false`, strength enforced by Zod.
- **Access tokens**: short-lived (15m) JWTs, issuer/audience checked.
- **Refresh tokens**: 30d, stored **hashed** (SHA-256), single-use with rotation. Replay of a rotated token revokes the whole session family and bumps `tokenVersion`, invalidating every issued token for that user. Delivered as an httpOnly, `SameSite=Strict`, path-scoped cookie (body fallback for native clients).
- **Authorization**: role gate (`customer`, `technician`, `admin`, `super_admin`); self-service signup can never create an admin. Ownership scoping is applied server-side on every list/detail query.
- **Input**: every body, query and param parsed with Zod; parsed output replaces the raw request so unknown keys never reach handlers.
- **Pricing**: computed server-side from the service catalog — client prices are ignored.
- **Hardening**: Helmet, strict CORS allowlist, `express-mongo-sanitize`, `hpp`, 1 MB payload cap, global + per-endpoint auth rate limits, no stack traces in production responses.
- **Logging**: Winston structured JSON in production with daily rotation; secrets and tokens are never logged.

## Endpoints (summary)

| Method | Path | Access |
| --- | --- | --- |
| POST | `/auth/register` · `/auth/login` · `/auth/refresh` · `/auth/logout` | public |
| POST/PATCH/GET | `/auth/logout-all` · `/auth/change-password` · `/auth/me` | authenticated |
| GET | `/services` · `/services/:id` | public |
| POST/PATCH/DELETE | `/services` · `/services/:id` | admin |
| GET | `/technicians` · `/technicians/:id` | public (approved only) |
| PATCH | `/technicians/me` | technician |
| GET/PATCH | `/technicians/verification-queue` · `/technicians/:id/verification` | admin |
| POST/GET | `/bookings` · `/bookings/:id` | authenticated (scoped) |
| PATCH | `/bookings/:id/assign` | admin |
| PATCH | `/bookings/:id/status` | admin · assigned tech · owner (cancel) |
| GET/POST | `/reviews` (public read) · `/reviews` (create) | mixed |
| PATCH | `/reviews/:id/moderate` | admin |
| GET | `/health` | public |

## Socket.IO events (structure)

Rooms: `user:<id>`, `admins`, `booking:<id>`.
Server emits: `booking:created`, `booking:assigned`, `booking:status`, `verification:updated`, `technician:location`.
Client emits: `booking:subscribe`, `technician:location`.
