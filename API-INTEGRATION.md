# ServicePro — Frontend ↔ API Integration Status

Base URL comes from `VITE_API_BASE_URL` (e.g. `http://localhost:4000/api/v1`).
Client lives in `src/lib/api.ts`. When the variable is unset, every wired screen
falls back to demo data but still performs the correct navigation.

## ✅ Connected (live call + navigation wired)

| Screen | Endpoint | On success navigates to |
| --- | --- | --- |
| `/admin-login` | `POST /auth/login` | `/admin` (replace) |
| `/admin/*` (guard) | local session check | `/admin-login` when no token |
| Admin sidebar Logout | `POST /auth/logout` | `/admin-login` (replace) |
| `/book` step 6 | `POST /bookings` | `/booking-confirmation?ref=…&service=…` |
| `/booking-confirmation` | reads `?ref` | `/track?ref=…` via Track button |
| `/track` | `GET /bookings/:ref` (polls 15s) | timeline advances with live status |
| `/apply` | `POST /auth/register` (role `technician`) | success state |
| `/contact` | `POST /support/tickets` | success state |

## ⏳ Remaining — still on static JSON (`src/data/*.ts`)

Public site
- `/services`, `/services/$slug` → `GET /services`, `GET /services/:id`
- `/technicians`, `/technicians/$slug` → `GET /technicians`, `GET /technicians/:id`
- Home / Why Us / Pricing / FAQ content → `GET /cms`
- Reviews on technician profiles → `GET /reviews`
- Booking step 2 technician availability → `GET /technicians?service=&date=`
- File uploads in `/book` and `/apply` → `POST /files`

Admin panel
- `/admin` dashboard → `GET /admin/dashboard`, `GET /admin/stats`
- `/admin/bookings`, `/admin/bookings/$bookingId` → `GET /admin/bookings`, `GET /bookings/:id`,
  `PATCH /bookings/:id/assign`, `PATCH /bookings/:id/status`
- `/admin/technicians` → `GET /technicians`, `PATCH /users/:id/status`
- `/admin/verification`, `/admin/verification/$techId` → `GET /technicians/verification-queue`,
  `PATCH /technicians/:id/verification`
- `/admin/customers` → `GET /users`, `PATCH /users/:id/status`
- `/admin/services` → `POST|PATCH|DELETE /services`
- `/admin/calendar` → `GET /admin/calendar`, `POST /admin/calendar/leave`
- `/admin/payments` → `GET /payments`
- `/admin/reviews` → `GET /reviews`, `PATCH /reviews/:id/moderate`
- `/admin/support` → `GET /support/tickets`, `POST /support/tickets/:id/messages`
- `/admin/notifications` → `GET /notifications`, `POST /notifications/broadcast`
- `/admin/reports` → `GET /admin/reports`
- `/admin/cms` → `GET /cms`, `PUT /cms/:key`
- `/admin/settings` → `GET /admin/settings`, `PATCH /admin/settings/:scope`
- `/admin/profile` → `GET /auth/me`, `PATCH /auth/change-password`, `POST /auth/logout-all`

## Not yet on the backend
- Forgot password / OTP verification (`/auth/forgot-password`, `/auth/reset-password`)
- Realtime tracking over Socket.IO (`booking:status`, `technician:location`) — structure only
- Payment capture / refunds against a provider
