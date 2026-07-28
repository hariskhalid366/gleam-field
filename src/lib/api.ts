/**
 * ServicePro API client.
 *
 * Points at the standalone Express backend in `backend/`.
 * Set VITE_API_BASE_URL (e.g. http://localhost:4000/api/v1) to enable live calls.
 * When it is not set, callers fall back to the bundled demo data so the UI keeps working.
 */

export const API_BASE_URL: string =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "") ?? "";

export const apiConfigured = API_BASE_URL.length > 0;

const ACCESS_TOKEN_KEY = "servicepro.accessToken";
const USER_KEY = "servicepro.user";

export type AuthUser = { id: string; name: string; email: string; role: string };

export const tokenStore = {
  get: () => (typeof window === "undefined" ? null : localStorage.getItem(ACCESS_TOKEN_KEY)),
  set: (t: string) => localStorage.setItem(ACCESS_TOKEN_KEY, t),
  clear: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
};

export const userStore = {
  get: (): AuthUser | null => {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(USER_KEY);
    try {
      return raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch {
      return null;
    }
  },
  set: (u: AuthUser) => localStorage.setItem(USER_KEY, JSON.stringify(u)),
};

export const isAuthenticated = () => !!tokenStore.get();

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  auth?: boolean;
  signal?: AbortSignal;
};

export async function apiRequest<T = unknown>(path: string, opts: RequestOptions = {}): Promise<T> {
  if (!apiConfigured) throw new ApiError("API base URL is not configured", 0);

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const token = tokenStore.get();
  if (opts.auth !== false && token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: opts.method ?? "GET",
    headers,
    credentials: "include",
    signal: opts.signal,
    body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
  });

  const payload = await res.json().catch(() => null);

  if (!res.ok) {
    if (res.status === 401) tokenStore.clear();
    throw new ApiError((payload as { message?: string } | null)?.message ?? res.statusText, res.status);
  }

  return ((payload as { data?: T } | null)?.data ?? (payload as T)) as T;
}

/* ------------------------------------------------------------------ *
 * Endpoint map — mirrors backend/src/routes.ts
 * ------------------------------------------------------------------ */
export const api = {
  auth: {
    login: (email: string, password: string) =>
      apiRequest<{ user: AuthUser; accessToken: string }>("/auth/login", {
        method: "POST",
        body: { email, password },
        auth: false,
      }),
    register: (body: Record<string, unknown>) =>
      apiRequest<{ user: AuthUser; accessToken: string }>("/auth/register", {
        method: "POST",
        body,
        auth: false,
      }),
    logout: () => apiRequest("/auth/logout", { method: "POST" }),
    me: () => apiRequest<AuthUser>("/auth/me"),
  },
  services: {
    list: () => apiRequest("/services"),
    detail: (id: string) => apiRequest(`/services/${id}`),
  },
  technicians: {
    list: (q = "") => apiRequest(`/technicians${q}`),
    detail: (id: string) => apiRequest(`/technicians/${id}`),
  },
  bookings: {
    create: (body: Record<string, unknown>) =>
      apiRequest<{ id: string; reference: string; status: string; total?: number }>("/bookings", {
        method: "POST",
        body,
      }),
    detail: (id: string) =>
      apiRequest<{ reference: string; status: string; technician?: { name?: string } }>(`/bookings/${id}`),
  },
  support: {
    createTicket: (body: Record<string, unknown>) =>
      apiRequest<{ id: string }>("/support/tickets", { method: "POST", body }),
  },
  admin: {
    dashboard: () => apiRequest("/admin/dashboard"),
    stats: () => apiRequest("/admin/stats"),
    bookings: (q = "") => apiRequest(`/admin/bookings${q}`),
    calendar: (q = "") => apiRequest(`/admin/calendar${q}`),
  },
};
