/** Static demo data for the main app. Swap for API responses when wiring the backend. */

export const JOB_STATUSES = [
  "pending",
  "assigned",
  "accepted",
  "travelling",
  "arrived",
  "in_progress",
  "paused",
  "completed",
  "verified",
  "cancelled",
] as const;

export type JobStatus = (typeof JOB_STATUSES)[number];

export const JOB_STATUS_LABEL: Record<JobStatus, string> = {
  pending: "Pending",
  assigned: "Assigned",
  accepted: "Accepted",
  travelling: "Travelling",
  arrived: "Arrived",
  in_progress: "In progress",
  paused: "Paused",
  completed: "Completed",
  verified: "Verified",
  cancelled: "Cancelled",
};

/** Forward-only status flow used by the active-job controls. */
export const JOB_FLOW: JobStatus[] = [
  "assigned",
  "accepted",
  "travelling",
  "arrived",
  "in_progress",
  "completed",
  "verified",
];

export type Job = {
  id: string;
  reference: string;
  category: string;
  glyph: string;
  title: string;
  status: JobStatus;
  scheduledFor: string;
  window: string;
  durationMins: number;
  price: number;
  distanceKm: number;
  urgent?: boolean;
  customer: {
    name: string;
    phone: string;
    rating: number;
    address: string;
    area: string;
    note?: string;
  };
  notes?: string;
  materials?: { name: string; qty: number; cost: number }[];
  beforePhotos?: number;
  afterPhotos?: number;
};

export const JOBS: Job[] = [
  {
    id: "j_401",
    reference: "SP-24019",
    category: "AC Technician",
    glyph: "❄️",
    title: "Split AC not cooling — gas top-up",
    status: "pending",
    scheduledFor: "Today",
    window: "2:00 PM – 4:00 PM",
    durationMins: 90,
    price: 4500,
    distanceKm: 3.2,
    urgent: true,
    customer: {
      name: "Sana Iqbal",
      phone: "+92 301 8887766",
      rating: 4.9,
      address: "House 42, Street 7, DHA Phase 5",
      area: "DHA",
      note: "Gate code 1180. Please call on arrival.",
    },
  },
  {
    id: "j_402",
    reference: "SP-24020",
    category: "Electrician",
    glyph: "⚡",
    title: "Distribution board tripping repeatedly",
    status: "pending",
    scheduledFor: "Today",
    window: "5:30 PM – 7:00 PM",
    durationMins: 60,
    price: 3200,
    distanceKm: 6.8,
    customer: {
      name: "Bilal Ahmed",
      phone: "+92 300 4451122",
      rating: 4.6,
      address: "Flat 3B, Sea Breeze Homes, Clifton",
      area: "Clifton",
    },
  },
  {
    id: "j_403",
    reference: "SP-24014",
    category: "Plumber",
    glyph: "🚿",
    title: "Kitchen sink leakage + trap replacement",
    status: "in_progress",
    scheduledFor: "Today",
    window: "10:00 AM – 11:30 AM",
    durationMins: 90,
    price: 2800,
    distanceKm: 1.4,
    customer: {
      name: "Hina Malik",
      phone: "+92 333 7788990",
      rating: 5,
      address: "B-19, Block 6, Gulshan-e-Iqbal",
      area: "Gulshan-e-Iqbal",
    },
    notes: "Trap corroded, replaced with PVC. Advised customer on drain cleaning.",
    materials: [{ name: "PVC bottle trap", qty: 1, cost: 850 }],
    beforePhotos: 2,
    afterPhotos: 0,
  },
  {
    id: "j_404",
    reference: "SP-24022",
    category: "Carpenter",
    glyph: "🪚",
    title: "Wardrobe hinge alignment (4 doors)",
    status: "accepted",
    scheduledFor: "Tomorrow",
    window: "9:00 AM – 10:30 AM",
    durationMins: 90,
    price: 2400,
    distanceKm: 4.1,
    customer: {
      name: "Omar Sheikh",
      phone: "+92 321 5566778",
      rating: 4.4,
      address: "House 7, Khayaban-e-Shamsheer",
      area: "DHA",
    },
  },
  {
    id: "j_405",
    reference: "SP-24001",
    category: "Appliance Repair",
    glyph: "🧰",
    title: "Washing machine drum bearing",
    status: "completed",
    scheduledFor: "Yesterday",
    window: "3:00 PM – 5:00 PM",
    durationMins: 120,
    price: 6200,
    distanceKm: 8.3,
    customer: {
      name: "Farah Naz",
      phone: "+92 345 1122334",
      rating: 4.8,
      address: "A-12, North Nazimabad Block H",
      area: "North Nazimabad",
    },
    beforePhotos: 3,
    afterPhotos: 3,
    materials: [{ name: "Drum bearing kit", qty: 1, cost: 2100 }],
  },
  {
    id: "j_406",
    reference: "SP-23988",
    category: "Painter",
    glyph: "🎨",
    title: "Living room touch-up (2 walls)",
    status: "cancelled",
    scheduledFor: "12 Jul",
    window: "11:00 AM – 2:00 PM",
    durationMins: 180,
    price: 9000,
    distanceKm: 12.5,
    customer: {
      name: "Zeeshan Tariq",
      phone: "+92 302 9988776",
      rating: 4.1,
      address: "Plot 55, Bahria Town",
      area: "Bahria Town",
    },
  },
];

export const EARNINGS = {
  today: 7300,
  week: 41200,
  month: 168400,
  pendingPayout: 23800,
  commissionRate: 0.15,
  weekly: [
    { day: "Mon", amount: 6200 },
    { day: "Tue", amount: 9100 },
    { day: "Wed", amount: 4800 },
    { day: "Thu", amount: 11400 },
    { day: "Fri", amount: 2400 },
    { day: "Sat", amount: 7300 },
    { day: "Sun", amount: 0 },
  ],
  transactions: [
    { id: "t1", label: "Washing machine drum bearing", ref: "SP-24001", amount: 6200, date: "Yesterday", type: "job" as const },
    { id: "t2", label: "Payout to HBL ••••4421", ref: "PO-8821", amount: -35000, date: "2 days ago", type: "payout" as const },
    { id: "t3", label: "Ceiling fan installation", ref: "SP-23994", amount: 3100, date: "3 days ago", type: "job" as const },
    { id: "t4", label: "Platform commission", ref: "CM-0714", amount: -1395, date: "3 days ago", type: "commission" as const },
  ],
};

export const PERFORMANCE = {
  rating: 4.8,
  reviews: 126,
  completionRate: 96,
  acceptanceRate: 88,
  onTimeRate: 92,
  score: 91,
};

export type Conversation = {
  id: string;
  name: string;
  role: "customer" | "admin";
  glyph: string;
  last: string;
  time: string;
  unread: number;
  messages: { id: string; from: "me" | "them"; text: string; time: string; kind?: "text" | "image" | "location" | "voice" }[];
};

export const CONVERSATIONS: Conversation[] = [
  {
    id: "c1",
    name: "Sana Iqbal",
    role: "customer",
    glyph: "❄️",
    last: "Please call when you reach the gate.",
    time: "12:24",
    unread: 2,
    messages: [
      { id: "m1", from: "them", text: "Hi, are you on the way?", time: "12:18" },
      { id: "m2", from: "me", text: "Yes, leaving now — about 20 minutes.", time: "12:20" },
      { id: "m3", from: "them", text: "Shared the building location", time: "12:22", kind: "location" },
      { id: "m4", from: "them", text: "Please call when you reach the gate.", time: "12:24" },
    ],
  },
  {
    id: "c2",
    name: "ServicePro Support",
    role: "admin",
    glyph: "🛡️",
    last: "Your payout of PKR 35,000 was processed.",
    time: "Yesterday",
    unread: 0,
    messages: [
      { id: "m1", from: "them", text: "Your payout of PKR 35,000 was processed.", time: "18:04" },
      { id: "m2", from: "me", text: "Received, thank you.", time: "18:20" },
    ],
  },
  {
    id: "c3",
    name: "Hina Malik",
    role: "customer",
    glyph: "🚿",
    last: "Photo of the leak",
    time: "Mon",
    unread: 0,
    messages: [
      { id: "m1", from: "them", text: "Photo of the leak", time: "09:41", kind: "image" },
      { id: "m2", from: "me", text: "Got it — I'll bring a replacement trap.", time: "09:45" },
    ],
  },
];

export type AppNotification = {
  id: string;
  kind: "job" | "approval" | "payment" | "promotion" | "system";
  title: string;
  body: string;
  time: string;
  unread: boolean;
};

export const NOTIFICATIONS: AppNotification[] = [
  { id: "n1", kind: "job", title: "New job request", body: "AC gas top-up in DHA — PKR 4,500, 3.2 km away.", time: "5m ago", unread: true },
  { id: "n2", kind: "payment", title: "Payment received", body: "PKR 6,200 credited for job SP-24001.", time: "1h ago", unread: true },
  { id: "n3", kind: "approval", title: "Documents verified", body: "Your trade licence has been approved.", time: "Yesterday", unread: false },
  { id: "n4", kind: "promotion", title: "Weekend bonus", body: "Complete 5 jobs this weekend and earn PKR 2,000 extra.", time: "2d ago", unread: false },
  { id: "n5", kind: "system", title: "App update", body: "Invoicing and customer signatures are now available.", time: "4d ago", unread: false },
];

export const ACTIVITIES = [
  { id: "a1", glyph: "✅", text: "Completed SP-24001 · PKR 6,200", time: "Yesterday" },
  { id: "a2", glyph: "⭐", text: "Farah Naz rated you 5 stars", time: "Yesterday" },
  { id: "a3", glyph: "📥", text: "Accepted SP-24022 for tomorrow", time: "2 days ago" },
];

export const DOCUMENTS = [
  { id: "d1", label: "CNIC (front & back)", status: "approved", updated: "12 Jun 2026" },
  { id: "d2", label: "Selfie verification", status: "approved", updated: "12 Jun 2026" },
  { id: "d3", label: "Trade licence", status: "approved", updated: "18 Jun 2026" },
  { id: "d4", label: "Skill certificates", status: "under_review", updated: "2 days ago" },
  { id: "d5", label: "Insurance", status: "draft", updated: "Not uploaded" },
];

/** Calendar demo: day-of-month → job count. */
export const CALENDAR_LOAD: Record<number, number> = {
  3: 2, 5: 1, 8: 3, 9: 1, 12: 2, 15: 4, 16: 1, 19: 2, 22: 3, 24: 1, 27: 2,
};

export const WORKING_HOURS = [
  { day: "Monday", hours: "9:00 AM – 7:00 PM", on: true },
  { day: "Tuesday", hours: "9:00 AM – 7:00 PM", on: true },
  { day: "Wednesday", hours: "9:00 AM – 7:00 PM", on: true },
  { day: "Thursday", hours: "9:00 AM – 7:00 PM", on: true },
  { day: "Friday", hours: "2:00 PM – 8:00 PM", on: true },
  { day: "Saturday", hours: "10:00 AM – 4:00 PM", on: true },
  { day: "Sunday", hours: "Day off", on: false },
];

export const fmtPKR = (n: number) =>
  `${n < 0 ? "-" : ""}PKR ${Math.abs(n).toLocaleString("en-PK")}`;
