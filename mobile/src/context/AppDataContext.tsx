import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import {
  ACTIVITIES,
  CONVERSATIONS,
  DOCUMENTS,
  EARNINGS,
  JOBS,
  JOB_FLOW,
  NOTIFICATIONS,
  WORKING_HOURS,
  type AppNotification,
  type Conversation,
  type Job,
  type JobStatus,
} from "@/data/jobs";

export type Material = { name: string; qty: number; cost: number };

export type LeaveRequest = {
  id: string;
  from: string;
  to: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
};

export type Activity = { id: string; glyph: string; text: string; time: string };

export type Transaction = {
  id: string;
  label: string;
  ref: string;
  amount: number;
  date: string;
  type: "job" | "payout" | "commission";
};

export type TechnicianProfile = {
  fullName: string;
  cnic: string;
  dateOfBirth: string;
  phone: string;
  email: string;
  address: string;
  headline: string;
  bio: string;
  experience: string;
  categories: string[];
  city: string;
  areas: string[];
  radiusKm: number;
  languages: string[];
  bank: { bankName: string; accountTitle: string; accountNumber: string; iban: string };
  emergency: { name: string; relation: string; phone: string };
};

export type DocumentRecord = {
  id: string;
  label: string;
  status: "approved" | "under_review" | "draft";
  updated: string;
};

export type WorkingHour = { day: string; hours: string; on: boolean };

export type Invoice = {
  jobId: string;
  number: string;
  issuedAt: string;
  labour: number;
  materials: number;
  commission: number;
  total: number;
};

const DEFAULT_PROFILE: TechnicianProfile = {
  fullName: "Ahmed Raza",
  cnic: "42101-1234567-1",
  dateOfBirth: "14 Mar 1992",
  phone: "+92 300 1234567",
  email: "ahmed.raza@servicepro.pk",
  address: "House 21, Block 4, Gulshan-e-Iqbal, Karachi",
  headline: "Senior AC & refrigeration technician",
  bio: "Ten years servicing split and inverter units for homes and small offices. Certified in gas handling and PCB diagnostics.",
  experience: "10+",
  categories: ["ac", "electrical", "appliance"],
  city: "Karachi",
  areas: ["Clifton", "DHA", "Gulshan-e-Iqbal"],
  radiusKm: 10,
  languages: ["Urdu", "English"],
  bank: {
    bankName: "HBL",
    accountTitle: "Ahmed Raza",
    accountNumber: "01234567894421",
    iban: "PK36HABB0000001234564421",
  },
  emergency: { name: "Sadia Raza", relation: "Spouse", phone: "+92 301 7654321" },
};

const now = () => new Date().toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit" });

type AppDataValue = {
  jobs: Job[];
  jobById: (id: string) => Job | undefined;
  online: boolean;
  setOnline: (v: boolean) => void;
  vacation: boolean;
  setVacation: (v: boolean) => void;
  workingHours: WorkingHour[];
  toggleWorkingDay: (day: string) => void;
  leaveRequests: LeaveRequest[];
  requestLeave: (req: Omit<LeaveRequest, "id" | "status">) => void;
  cancelLeave: (id: string) => void;

  acceptJob: (id: string) => void;
  declineJob: (id: string, reason: string) => void;
  counterSchedule: (id: string, slot: string) => void;
  advanceJob: (id: string) => void;
  pauseJob: (id: string) => void;
  resumeJob: (id: string) => void;
  addPhoto: (id: string, kind: "before" | "after") => void;
  setJobNotes: (id: string, notes: string) => void;
  addMaterial: (id: string, material: Material) => void;
  signJob: (id: string) => void;
  invoices: Record<string, Invoice>;
  generateInvoice: (id: string) => Invoice | undefined;

  notifications: AppNotification[];
  unreadCount: number;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  clearNotifications: () => void;

  conversations: Conversation[];
  sendMessage: (conversationId: string, text: string, kind?: string) => void;
  openConversation: (conversationId: string) => void;

  activities: Activity[];
  transactions: Transaction[];
  pendingPayout: number;
  withdraw: (amount: number) => void;

  documents: DocumentRecord[];
  replaceDocument: (id: string) => void;

  profile: TechnicianProfile;
  updateProfile: (patch: Partial<TechnicianProfile>) => void;
};

const AppDataContext = createContext<AppDataValue | null>(null);

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const [jobs, setJobs] = useState<Job[]>(() => JOBS.map((j) => ({ ...j })));
  const [online, setOnline] = useState(true);
  const [vacation, setVacation] = useState(false);
  const [workingHours, setWorkingHours] = useState<WorkingHour[]>(() => WORKING_HOURS.map((w) => ({ ...w })));
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([
    { id: "lv1", from: "22 Aug 2026", to: "24 Aug 2026", reason: "Family wedding", status: "approved" },
    { id: "lv2", from: "09 Sep 2026", to: "09 Sep 2026", reason: "Medical appointment", status: "pending" },
  ]);
  const [notifications, setNotifications] = useState<AppNotification[]>(() =>
    NOTIFICATIONS.map((n) => ({ ...n })),
  );
  const [conversations, setConversations] = useState<Conversation[]>(() =>
    CONVERSATIONS.map((c) => ({ ...c, messages: [...c.messages] })),
  );
  const [activities, setActivities] = useState<Activity[]>(() => ACTIVITIES.map((a) => ({ ...a })));
  const [transactions, setTransactions] = useState<Transaction[]>(() =>
    EARNINGS.transactions.map((t) => ({ ...t })),
  );
  const [pendingPayout, setPendingPayout] = useState(EARNINGS.pendingPayout);
  const [documents, setDocuments] = useState<DocumentRecord[]>(
    () => DOCUMENTS.map((d) => ({ ...d })) as DocumentRecord[],
  );
  const [profile, setProfile] = useState<TechnicianProfile>(DEFAULT_PROFILE);
  const [invoices, setInvoices] = useState<Record<string, Invoice>>({});

  const logActivity = useCallback((glyph: string, text: string) => {
    setActivities((a) => [{ id: `a_${Date.now()}`, glyph, text, time: "Just now" }, ...a].slice(0, 12));
  }, []);

  const pushNotification = useCallback((n: Omit<AppNotification, "id" | "time" | "unread">) => {
    setNotifications((list) => [
      { ...n, id: `n_${Date.now()}`, time: "Just now", unread: true },
      ...list,
    ]);
  }, []);

  const patchJob = useCallback((id: string, patch: Partial<Job>) => {
    setJobs((list) => list.map((j) => (j.id === id ? { ...j, ...patch } : j)));
  }, []);

  const jobById = useCallback((id: string) => jobs.find((j) => j.id === id), [jobs]);

  const acceptJob = useCallback(
    (id: string) => {
      patchJob(id, { status: "accepted" });
      const job = jobs.find((j) => j.id === id);
      logActivity("📥", `Accepted ${job?.reference ?? id}`);
    },
    [jobs, logActivity, patchJob],
  );

  const declineJob = useCallback(
    (id: string, reason: string) => {
      patchJob(id, { status: "cancelled" });
      const job = jobs.find((j) => j.id === id);
      logActivity("🚫", `Declined ${job?.reference ?? id} · ${reason}`);
    },
    [jobs, logActivity, patchJob],
  );

  const counterSchedule = useCallback(
    (id: string, slot: string) => {
      patchJob(id, { window: slot, status: "assigned" });
      pushNotification({
        kind: "job",
        title: "Alternative time proposed",
        body: `You suggested ${slot}. Waiting for the customer to confirm.`,
      });
    },
    [patchJob, pushNotification],
  );

  const advanceJob = useCallback(
    (id: string) => {
      setJobs((list) =>
        list.map((j) => {
          if (j.id !== id) return j;
          if (j.status === "paused") return { ...j, status: "in_progress" as JobStatus };
          const next = JOB_FLOW[JOB_FLOW.indexOf(j.status) + 1];
          return next ? { ...j, status: next } : j;
        }),
      );
      const job = jobs.find((j) => j.id === id);
      if (job && job.status === "in_progress") {
        setTransactions((t) => [
          {
            id: `t_${Date.now()}`,
            label: job.title,
            ref: job.reference,
            amount: job.price,
            date: "Just now",
            type: "job",
          },
          ...t,
        ]);
        setPendingPayout((p) => p + job.price);
        logActivity("✅", `Completed ${job.reference}`);
        pushNotification({
          kind: "payment",
          title: "Payment pending",
          body: `${job.reference} completed — payout will be released after verification.`,
        });
      }
    },
    [jobs, logActivity, pushNotification],
  );

  const pauseJob = useCallback((id: string) => patchJob(id, { status: "paused" }), [patchJob]);
  const resumeJob = useCallback((id: string) => patchJob(id, { status: "in_progress" }), [patchJob]);

  const addPhoto = useCallback(
    (id: string, kind: "before" | "after") => {
      setJobs((list) =>
        list.map((j) =>
          j.id === id
            ? kind === "before"
              ? { ...j, beforePhotos: (j.beforePhotos ?? 0) + 1 }
              : { ...j, afterPhotos: (j.afterPhotos ?? 0) + 1 }
            : j,
        ),
      );
    },
    [],
  );

  const setJobNotes = useCallback((id: string, notes: string) => patchJob(id, { notes }), [patchJob]);

  const addMaterial = useCallback((id: string, material: Material) => {
    setJobs((list) =>
      list.map((j) => (j.id === id ? { ...j, materials: [...(j.materials ?? []), material] } : j)),
    );
  }, []);

  const signJob = useCallback(
    (id: string) => {
      const job = jobs.find((j) => j.id === id);
      logActivity("✍️", `Signature captured for ${job?.reference ?? id}`);
    },
    [jobs, logActivity],
  );

  const generateInvoice = useCallback(
    (id: string) => {
      const job = jobs.find((j) => j.id === id);
      if (!job) return undefined;
      const materials = (job.materials ?? []).reduce((s, m) => s + m.cost * m.qty, 0);
      const labour = job.price;
      const commission = Math.round((labour + materials) * EARNINGS.commissionRate);
      const invoice: Invoice = {
        jobId: id,
        number: `INV-${job.reference.replace("SP-", "")}`,
        issuedAt: new Date().toLocaleDateString("en-PK", { day: "2-digit", month: "short", year: "numeric" }),
        labour,
        materials,
        commission,
        total: labour + materials,
      };
      setInvoices((inv) => ({ ...inv, [id]: invoice }));
      return invoice;
    },
    [jobs],
  );

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((list) => list.map((n) => (n.id === id ? { ...n, unread: false } : n)));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((list) => list.map((n) => ({ ...n, unread: false })));
  }, []);

  const clearNotifications = useCallback(() => setNotifications([]), []);

  const sendMessage = useCallback((conversationId: string, text: string, kind?: string) => {
    if (!text.trim()) return;
    setConversations((list) =>
      list.map((c) =>
        c.id === conversationId
          ? {
              ...c,
              last: text,
              time: now(),
              messages: [
                ...c.messages,
                {
                  id: `m_${Date.now()}`,
                  from: "me" as const,
                  text,
                  time: now(),
                  kind: (kind as Conversation["messages"][number]["kind"]) ?? "text",
                },
              ],
            }
          : c,
      ),
    );
  }, []);

  const openConversation = useCallback((conversationId: string) => {
    setConversations((list) => list.map((c) => (c.id === conversationId ? { ...c, unread: 0 } : c)));
  }, []);

  const withdraw = useCallback(
    (amount: number) => {
      const value = Math.min(amount, pendingPayout);
      if (value <= 0) return;
      setPendingPayout((p) => p - value);
      setTransactions((t) => [
        {
          id: `t_${Date.now()}`,
          label: `Payout to ${profile.bank.bankName} ••••${profile.bank.accountNumber.slice(-4)}`,
          ref: `PO-${Math.floor(1000 + Math.random() * 9000)}`,
          amount: -value,
          date: "Just now",
          type: "payout",
        },
        ...t,
      ]);
      pushNotification({
        kind: "payment",
        title: "Withdrawal requested",
        body: `PKR ${value.toLocaleString("en-PK")} is on its way to your ${profile.bank.bankName} account.`,
      });
    },
    [pendingPayout, profile.bank, pushNotification],
  );

  const replaceDocument = useCallback((id: string) => {
    setDocuments((list) =>
      list.map((d) => (d.id === id ? { ...d, status: "under_review", updated: "Just now" } : d)),
    );
  }, []);

  const toggleWorkingDay = useCallback((day: string) => {
    setWorkingHours((list) => list.map((w) => (w.day === day ? { ...w, on: !w.on } : w)));
  }, []);

  const requestLeave = useCallback((req: Omit<LeaveRequest, "id" | "status">) => {
    setLeaveRequests((list) => [{ ...req, id: `lv_${Date.now()}`, status: "pending" }, ...list]);
  }, []);

  const cancelLeave = useCallback((id: string) => {
    setLeaveRequests((list) => list.filter((l) => l.id !== id));
  }, []);

  const updateProfile = useCallback((patch: Partial<TechnicianProfile>) => {
    setProfile((p) => ({ ...p, ...patch }));
  }, []);

  const value = useMemo<AppDataValue>(
    () => ({
      jobs,
      jobById,
      online: online && !vacation,
      setOnline,
      vacation,
      setVacation,
      workingHours,
      toggleWorkingDay,
      leaveRequests,
      requestLeave,
      cancelLeave,
      acceptJob,
      declineJob,
      counterSchedule,
      advanceJob,
      pauseJob,
      resumeJob,
      addPhoto,
      setJobNotes,
      addMaterial,
      signJob,
      invoices,
      generateInvoice,
      notifications,
      unreadCount: notifications.filter((n) => n.unread).length,
      markNotificationRead,
      markAllNotificationsRead,
      clearNotifications,
      conversations,
      sendMessage,
      openConversation,
      activities,
      transactions,
      pendingPayout,
      withdraw,
      documents,
      replaceDocument,
      profile,
      updateProfile,
    }),
    [
      jobs,
      jobById,
      online,
      vacation,
      workingHours,
      toggleWorkingDay,
      leaveRequests,
      requestLeave,
      cancelLeave,
      acceptJob,
      declineJob,
      counterSchedule,
      advanceJob,
      pauseJob,
      resumeJob,
      addPhoto,
      setJobNotes,
      addMaterial,
      signJob,
      invoices,
      generateInvoice,
      notifications,
      markNotificationRead,
      markAllNotificationsRead,
      clearNotifications,
      conversations,
      sendMessage,
      openConversation,
      activities,
      transactions,
      pendingPayout,
      withdraw,
      documents,
      replaceDocument,
      profile,
      updateProfile,
    ],
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData(): AppDataValue {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData must be used inside <AppDataProvider>");
  return ctx;
}
