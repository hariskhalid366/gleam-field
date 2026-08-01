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
type AuthResponse = { user: AuthUser & { _id?: string }; accessToken: string };

export type ApiService = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  category?: string;
  basePrice: number;
  emergencyPrice: number;
  estimatedDuration: string;
  icon?: string;
  included?: string[];
  isActive?: boolean;
};

export type ServiceInput = {
  name: string;
  slug: string;
  description?: string;
  category: string;
  basePrice: number;
  emergencyPrice: number;
  estimatedDuration?: string;
  icon?: string;
  included: string[];
  isActive: boolean;
};

export type ApiTechnician = {
  _id: string;
  city: string;
  services: string[];
  experienceYears: number;
  hourlyRate: number;
  rating: number;
  jobsCompleted: number;
  isAvailable: boolean;
  user?: { name?: string; avatarUrl?: string; city?: string };
};

export type PublicSiteContent = {
  testimonials?: Array<{ id: number; name: string; role: string; avatar: string; rating: number; quote: string }>;
  trustedCompanies?: string[];
  pricingPlans?: Array<{ id: string; name: string; price: number; cadence: string; description: string; features: string[]; recommended: boolean }>;
  faqs?: Array<{ q: string; a: string }>;
};

export type WhyUsContent = {
  eyebrow: string;
  title: string;
  emphasizedTitle: string;
  description: string;
  values: Array<{ icon: string; title: string; description: string }>;
  metrics: Array<{ value: string; label: string }>;
};

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

/** Persist only the short-lived access token and minimal profile in localStorage.
 * The long-lived refresh token remains in the backend's httpOnly cookie. */
export function startSession(session: AuthResponse): AuthUser {
  const user: AuthUser = {
    id: session.user.id ?? session.user._id ?? "",
    name: session.user.name,
    email: session.user.email,
    role: session.user.role,
  };
  tokenStore.set(session.accessToken);
  userStore.set(user);
  return user;
}

export class ApiError extends Error {
  status: number;
  fieldErrors?: Record<string, string[]>;
  constructor(message: string, status: number, fieldErrors?: Record<string, string[]>) {
    super(message);
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  auth?: boolean;
  signal?: AbortSignal;
};

export type BookingCreateInput = {
  service: string;
  technician?: string;
  scheduledFor: string;
  isEmergency: boolean;
  address: { line1: string; city: string; postalCode?: string; notes?: string };
  photoFileIds?: string[];
};

export type BookingTracking = {
  _id: string;
  reference: string;
  status: string;
  scheduledFor: string;
  address: { line1: string; city: string; postalCode?: string; notes?: string };
  price: { total: number; currency: string };
  customer: { name: string; email: string; avatarUrl?: string };
  technician?: { rating: number; jobsCompleted: number; user?: { name?: string; email?: string; avatarUrl?: string } };
  service?: { name?: string; slug?: string };
  timeline: Array<{ status: string; at: string; note?: string }>;
};

let refreshingSession: Promise<boolean> | null = null;

async function refreshSession(): Promise<boolean> {
  if (!apiConfigured) return false;
  if (!refreshingSession) {
    refreshingSession = fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include",
    })
      .then(async (res) => {
        const payload = await res.json().catch(() => null);
        if (!res.ok) {
          tokenStore.clear();
          return false;
        }
        startSession((payload as { data: AuthResponse }).data);
        return true;
      })
      .catch(() => {
        tokenStore.clear();
        return false;
      })
      .finally(() => { refreshingSession = null; });
  }
  return refreshingSession;
}

export async function apiRequest<T = unknown>(path: string, opts: RequestOptions = {}, retried = false): Promise<T> {
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
    if (res.status === 401 && opts.auth !== false && !retried && path !== "/auth/refresh" && await refreshSession()) {
      return apiRequest<T>(path, opts, true);
    }
    if (res.status === 401) tokenStore.clear();
    const body = payload as { message?: string; errors?: Record<string, string[]> } | null;
    throw new ApiError(body?.message ?? res.statusText, res.status, body?.errors);
  }

  return ((payload as { data?: T } | null)?.data ?? (payload as T)) as T;
}

async function uploadFile(file: File, purpose: "booking_photo"): Promise<{ fileId: string; url: string }> {
  if (!apiConfigured) throw new ApiError("API base URL is not configured", 0);
  const token = tokenStore.get();
  if (!token) throw new ApiError("Please sign in before uploading photos", 401);
  const form = new FormData();
  form.set("file", file);
  const res = await fetch(`${API_BASE_URL}/files?purpose=${purpose}`, {
    method: "POST", headers: { Authorization: `Bearer ${token}` }, credentials: "include", body: form,
  });
  const payload = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError((payload as { message?: string } | null)?.message ?? res.statusText, res.status);
  return (payload as { data: { fileId: string; url: string } }).data;
}

/* ------------------------------------------------------------------ *
 * Endpoint map — mirrors backend/src/routes.ts
 * ------------------------------------------------------------------ */
export const api = {
  auth: {
    login: (email: string, password: string) =>
      apiRequest<AuthResponse>("/auth/login", {
        method: "POST",
        body: { email, password },
        auth: false,
      }),
    register: (body: Record<string, unknown>) =>
      apiRequest<AuthResponse>("/auth/register", {
        method: "POST",
        body,
        auth: false,
      }),
    logout: async () => {
      try {
        await apiRequest("/auth/logout", { method: "POST" });
      } finally {
        tokenStore.clear();
      }
    },
    refresh: () => refreshSession(),
    me: () => apiRequest<AuthUser>("/auth/me"),
  },
  services: {
    list: () => apiRequest<ApiService[]>("/services", { auth: false }),
    listAdmin: () => apiRequest<ApiService[]>("/services/admin/list"),
    detail: (id: string) => apiRequest<ApiService>(`/services/${id}`, { auth: false }),
    detailBySlug: (slug: string) => apiRequest<ApiService>(`/services/slug/${slug}`, { auth: false }),
    create: (body: ServiceInput) => apiRequest<ApiService>("/services", { method: "POST", body }),
    update: (id: string, body: Partial<ServiceInput>) =>
      apiRequest<ApiService>(`/services/${id}`, { method: "PATCH", body }),
    deactivate: (id: string) => apiRequest<ApiService>(`/services/${id}`, { method: "DELETE" }),
  },
  technicians: {
    list: (q = "") => apiRequest<ApiTechnician[]>(`/technicians${q}`, { auth: false }),
    detail: (id: string) => apiRequest<ApiTechnician>(`/technicians/${id}`, { auth: false }),
  },
  content: {
    publicSite: () => apiRequest<{ data: PublicSiteContent }>("/content/public.site", { auth: false }),
    whyUs: () => apiRequest<{ data: WhyUsContent }>("/content/public.why-us", { auth: false }),
  },
  bookings: {
    create: (body: BookingCreateInput) =>
      apiRequest<{ _id: string; reference: string; status: string; price: { total: number; currency: string } }>("/bookings", {
        method: "POST",
        body,
      }),
    detail: (id: string) =>
      apiRequest<BookingTracking>(`/bookings/${id}`),
    cancel: (id: string, note?: string) =>
      apiRequest(`/bookings/${id}/status`, { method: "PATCH", body: { status: "cancelled", note } }),
  },
  files: { uploadBookingPhoto: (file: File) => uploadFile(file, "booking_photo") },
  support: {
    createTicket: (body: Record<string, unknown>) =>
      apiRequest<{ id: string }>("/support/tickets", { method: "POST", body }),
    contact: (body: { name: string; email: string; subject: string; message: string }) =>
      apiRequest<{ id: string; priority: string; repeatContact: boolean }>("/support/contact", { method: "POST", body, auth: false }),
  },
  admin: {
    dashboard: () => apiRequest("/admin/dashboard"),
    stats: () => apiRequest("/admin/stats"),
    bookings: (q = "") => apiRequest(`/admin/bookings${q}`),
    calendar: (q = "") => apiRequest(`/admin/calendar${q}`),
  },
};
