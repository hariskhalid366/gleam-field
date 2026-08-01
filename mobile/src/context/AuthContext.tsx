import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { EMPTY_REGISTRATION, RegistrationData } from "@/types/registration";

export type ApplicationStatus =
  | "none"
  | "submitted"
  | "pending"
  | "approved"
  | "rejected"
  | "suspended"
  | "blocked";

export type Technician = {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: ApplicationStatus;
  submittedAt?: string;
  rejection?: { reason: string; corrections: string[] };
};

type AuthValue = {
  technician: Technician | null;
  status: ApplicationStatus;
  registration: RegistrationData;
  loading: boolean;
  updateRegistration: (patch: Partial<RegistrationData>) => void;
  resetRegistration: () => void;
  login: (email: string, password: string) => Promise<void>;
  submitApplication: () => Promise<void>;
  resubmitApplication: () => Promise<void>;
  logout: () => void;
  /** Dev-only helper that simulates an admin decision. */
  simulateDecision: (next: ApplicationStatus) => void;
};

const AuthContext = createContext<AuthValue | null>(null);

const REJECTION_SAMPLE = {
  reason: "The CNIC photo is blurred and the trade licence has expired.",
  corrections: [
    "Re-upload a sharp, full-frame photo of your CNIC (both sides).",
    "Upload a trade licence valid for at least 3 more months.",
    "Retake your selfie in daylight, without sunglasses or a cap.",
  ],
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [technician, setTechnician] = useState<Technician | null>(null);
  const [registration, setRegistration] = useState<RegistrationData>(EMPTY_REGISTRATION);
  const [loading, setLoading] = useState(false);

  const updateRegistration = useCallback((patch: Partial<RegistrationData>) => {
    setRegistration((prev) => ({ ...prev, ...patch }));
  }, []);

  const resetRegistration = useCallback(() => setRegistration(EMPTY_REGISTRATION), []);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      // Replace with POST /auth/login against the ServicePro API.
      await new Promise((r) => setTimeout(r, 700));
      if (password.length < 6) throw new Error("Invalid email or password");

      // Demo routing: the email prefix decides which gate the technician hits.
      const prefix = email.split("@")[0]?.toLowerCase() ?? "";
      const status: ApplicationStatus = prefix.startsWith("pending")
        ? "pending"
        : prefix.startsWith("rejected")
          ? "rejected"
          : prefix.startsWith("suspended")
            ? "suspended"
            : prefix.startsWith("blocked")
              ? "blocked"
              : "approved";

      if (status === "blocked") throw new Error("This account has been blocked. Contact support.");

      setTechnician({
        id: "tech_1024",
        name: "Ahmed Raza",
        email,
        phone: "+92 300 1234567",
        status,
        submittedAt: new Date().toISOString(),
        rejection: status === "rejected" ? REJECTION_SAMPLE : undefined,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const submitApplication = useCallback(async () => {
    setLoading(true);
    try {
      // Replace with POST /auth/register + POST /technicians/me documents.
      await new Promise((r) => setTimeout(r, 900));
      setTechnician({
        id: "tech_new",
        name: `${registration.firstName} ${registration.lastName}`.trim() || "New technician",
        email: registration.email,
        phone: registration.phone,
        status: "submitted",
        submittedAt: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  }, [registration]);

  const resubmitApplication = useCallback(async () => {
    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 900));
      setTechnician((t) => (t ? { ...t, status: "pending", rejection: undefined } : t));
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setTechnician(null);
    setRegistration(EMPTY_REGISTRATION);
  }, []);

  const simulateDecision = useCallback((next: ApplicationStatus) => {
    setTechnician((t) =>
      t
        ? { ...t, status: next, rejection: next === "rejected" ? REJECTION_SAMPLE : undefined }
        : t,
    );
  }, []);

  const value = useMemo<AuthValue>(
    () => ({
      technician,
      status: technician?.status ?? "none",
      registration,
      loading,
      updateRegistration,
      resetRegistration,
      login,
      submitApplication,
      resubmitApplication,
      logout,
      simulateDecision,
    }),
    [
      technician,
      registration,
      loading,
      updateRegistration,
      resetRegistration,
      login,
      submitApplication,
      resubmitApplication,
      logout,
      simulateDecision,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
