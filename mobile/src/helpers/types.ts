export type Product = {
  _id: string;
  slug: string;
  name: string;
  brand?: string;
  description?: string;
  price: number;
  compareAt?: number;
  unit?: string;
  emoji?: string;
  category?: string;
  rating?: number;
  aiTag?: string;
  organic?: boolean;
};

export type Category = { _id: string; slug: string; name: string; emoji?: string };
export type Banner = { _id: string; title: string; subtitle?: string; ctaLabel?: string };
export type Order = {
  _id: string;
  reference: string;
  total: number;
  status: string;
  placedAt: string;
  items: { name: string; qty: number; price: number }[];
};
export type User = { id: string; _id?: string; name: string; email: string; role: string; phone?: string; city?: string; avatarUrl?: string };
export type Address = { _id?: string; label: string; line1: string; city: string; postcode: string; isDefault?: boolean };
export type PaymentMethod = { _id?: string; provider: "stripe" | "apple_pay" | "google_pay"; providerPaymentMethodId: string; brand?: string; last4?: string; isDefault?: boolean };
export type AiPreferences = { healthySwaps: boolean; budgetAlerts: boolean; weeklyBudget: number; dietaryPreferences: string[] };
export type UserNotification = { _id: string; title: string; body?: string; category?: string; channel: string; readAt?: string };

export type AuthState = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  verificationStatus?: "none" | "submitted" | "pending" | "approved" | "rejected" | "suspended" | "blocked";
};

export type GeneralConfigs = Record<string, unknown>;
export type CONTENT_TYPE = "terms" | "privacy";
export type AppContent = { type: CONTENT_TYPE; content: string };
export type ContentResponse = { data: AppContent };
export type Mode = { id: string; name: string };
