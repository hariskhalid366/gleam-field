import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { EMPTY_REGISTRATION, type RegistrationData } from "@/types/registration";
import { authApi } from "@/redux/Apis/Auth";
import { logout as clearSession, setVerificationStatus } from "@/redux/slice/authSlice";
import { useAppDispatch, useAppSelector } from "@/redux/hook/hook";

export type ApplicationStatus = "none" | "submitted" | "pending" | "approved" | "rejected" | "suspended" | "blocked";
export type Technician = { id: string; name: string; email: string; phone: string; status: ApplicationStatus; submittedAt?: string; rejection?: { reason: string; corrections: string[] } };
type AuthValue = { technician: Technician | null; status: ApplicationStatus; registration: RegistrationData; loading: boolean; updateRegistration: (patch: Partial<RegistrationData>) => void; resetRegistration: () => void; login: (email: string, password: string) => Promise<void>; submitApplication: () => Promise<void>; resubmitApplication: () => Promise<void>; logout: () => void; simulateDecision: (next: ApplicationStatus) => void };
const AuthContext = createContext<AuthValue | null>(null);

/** Screen compatibility bridge: session state is Redux-persisted; this owns only
 * the incomplete registration draft until document upload is connected. */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const session = useAppSelector((state) => state.auth);
  const [registration, setRegistration] = useState<RegistrationData>(EMPTY_REGISTRATION);
  const [loading, setLoading] = useState(false);
  const [draftStatus, setDraftStatus] = useState<ApplicationStatus>("none");
  const status = session.isAuthenticated ? (session.verificationStatus ?? "pending") : draftStatus;
  const technician = session.user ? { id: session.user.id, name: session.user.name, email: session.user.email, phone: "", status } : status !== "none" ? { id: "application-draft", name: `${registration.firstName} ${registration.lastName}`.trim() || "New technician", email: registration.email, phone: registration.phone, status, submittedAt: new Date().toISOString() } : null;
  const updateRegistration = useCallback((patch: Partial<RegistrationData>) => setRegistration((previous) => ({ ...previous, ...patch })), []);
  const resetRegistration = useCallback(() => setRegistration(EMPTY_REGISTRATION), []);
  const login = useCallback(async (email: string, password: string) => { setLoading(true); try { const result = await dispatch(authApi.endpoints.login.initiate({ email, password })).unwrap(); if (result.user.role !== "technician") { dispatch(clearSession()); throw new Error("This account is not a technician account."); } const profile = await dispatch(authApi.endpoints.technicianMe.initiate(undefined, { forceRefetch: true })).unwrap(); dispatch(setVerificationStatus(profile.verificationStatus)); if (profile.verificationStatus === "blocked") { dispatch(clearSession()); throw new Error("This account has been blocked. Contact support."); } } finally { setLoading(false); } }, [dispatch]);
  const submitApplication = useCallback(async () => { setLoading(true); try { setDraftStatus("submitted"); } finally { setLoading(false); } }, []);
  const resubmitApplication = useCallback(async () => { setLoading(true); try { setDraftStatus("pending"); } finally { setLoading(false); } }, []);
  const logout = useCallback(() => { dispatch(clearSession()); setDraftStatus("none"); setRegistration(EMPTY_REGISTRATION); }, [dispatch]);
  const simulateDecision = useCallback((next: ApplicationStatus) => setDraftStatus(next), []);
  const value = useMemo<AuthValue>(() => ({ technician, status, registration, loading, updateRegistration, resetRegistration, login, submitApplication, resubmitApplication, logout, simulateDecision }), [technician, status, registration, loading, updateRegistration, resetRegistration, login, submitApplication, resubmitApplication, logout, simulateDecision]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth(): AuthValue { const context = useContext(AuthContext); if (!context) throw new Error("useAuth must be used inside <AuthProvider>"); return context; }
