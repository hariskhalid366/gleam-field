/* Static mock data powering the ServicePro Admin Panel. No backend. */

export type BookingStatus =
  | "pending"
  | "assigned"
  | "accepted"
  | "travelling"
  | "arrived"
  | "working"
  | "completed"
  | "cancelled"
  | "rejected";

export type VerificationStatus =
  | "pending"
  | "under_review"
  | "approved"
  | "rejected"
  | "suspended"
  | "blocked";

export const bookingStatusMeta: Record<BookingStatus, { label: string; tone: Tone }> = {
  pending: { label: "Pending", tone: "amber" },
  assigned: { label: "Assigned", tone: "blue" },
  accepted: { label: "Accepted", tone: "indigo" },
  travelling: { label: "Travelling", tone: "cyan" },
  arrived: { label: "Arrived", tone: "violet" },
  working: { label: "Working", tone: "blue" },
  completed: { label: "Completed", tone: "emerald" },
  cancelled: { label: "Cancelled", tone: "slate" },
  rejected: { label: "Rejected", tone: "red" },
};

export const verificationStatusMeta: Record<VerificationStatus, { label: string; tone: Tone }> = {
  pending: { label: "Pending", tone: "amber" },
  under_review: { label: "Under Review", tone: "blue" },
  approved: { label: "Approved", tone: "emerald" },
  rejected: { label: "Rejected", tone: "red" },
  suspended: { label: "Suspended", tone: "amber" },
  blocked: { label: "Blocked", tone: "slate" },
};

export type Tone = "blue" | "emerald" | "amber" | "red" | "slate" | "violet" | "indigo" | "cyan";

const avatar = (seed: string) => `https://i.pravatar.cc/160?u=${seed}`;

export const serviceCatalog = [
  { id: "s1", name: "Electrical", price: 49, emergencyPrice: 99, duration: "60 min", tools: ["Multimeter", "Insulated kit"], active: true, jobs: 412 },
  { id: "s2", name: "Plumbing", price: 59, emergencyPrice: 119, duration: "45 min", tools: ["Pipe wrench", "Snake auger"], active: true, jobs: 388 },
  { id: "s3", name: "Air Conditioning", price: 79, emergencyPrice: 149, duration: "90 min", tools: ["Gauge set", "Vacuum pump"], active: true, jobs: 301 },
  { id: "s4", name: "Carpentry", price: 45, emergencyPrice: 95, duration: "120 min", tools: ["Circular saw", "Router"], active: true, jobs: 176 },
  { id: "s5", name: "Painting", price: 120, emergencyPrice: 180, duration: "1 day", tools: ["Sprayer", "Drop cloths"], active: true, jobs: 143 },
  { id: "s6", name: "Deep Cleaning", price: 89, emergencyPrice: 139, duration: "3 hrs", tools: ["Steam cleaner"], active: true, jobs: 264 },
  { id: "s7", name: "Pest Control", price: 99, emergencyPrice: 159, duration: "1 hr", tools: ["Sprayer", "PPE"], active: false, jobs: 88 },
  { id: "s8", name: "Appliance Repair", price: 69, emergencyPrice: 129, duration: "60 min", tools: ["Diagnostic kit"], active: true, jobs: 205 },
  { id: "s9", name: "Mechanic", price: 89, emergencyPrice: 169, duration: "75 min", tools: ["OBD scanner"], active: true, jobs: 121 },
];

export type AdminTechnician = {
  id: string;
  name: string;
  avatar: string;
  email: string;
  phone: string;
  city: string;
  services: string[];
  experience: number;
  rating: number;
  jobs: number;
  revenue: number;
  status: VerificationStatus;
  availability: "available" | "busy" | "offline";
  appliedAt: string;
  bank: string;
  employment: "Contractor" | "Full-time";
  rejectionReason?: string;
  bio: string;
  emergencyContact: string;
  serviceAreas: string[];
  workingHours: string;
  certificates: string[];
  documents: { name: string; type: string; uploadedAt: string; verified: boolean }[];
};

const techSeed: Array<[string, string, string, string[], number, number, number, VerificationStatus]> = [
  ["Marcus Chen", "San Francisco", "marcus", ["Electrical", "Smart Home"], 9, 4.9, 1240, "approved"],
  ["Amina Yusuf", "Austin", "amina", ["Plumbing"], 7, 5.0, 860, "approved"],
  ["Diego Alvarez", "Miami", "diego", ["Air Conditioning"], 12, 4.8, 1810, "approved"],
  ["Priya Natarajan", "Seattle", "priya", ["Appliance Repair"], 6, 4.9, 720, "approved"],
  ["James O'Connell", "Boston", "james", ["Carpentry"], 15, 4.7, 2050, "suspended"],
  ["Sofia Rossi", "New York", "sofia", ["Painting"], 8, 4.9, 940, "approved"],
  ["Tomas Novak", "Chicago", "tomas", ["Electrical"], 4, 4.6, 180, "pending"],
  ["Leila Haddad", "Denver", "leila", ["Plumbing", "Water Systems"], 5, 4.8, 240, "pending"],
  ["Ryan Whitfield", "Portland", "ryan", ["Mechanic"], 11, 4.5, 990, "under_review"],
  ["Grace Mbeki", "Atlanta", "grace", ["Deep Cleaning"], 3, 4.7, 130, "pending"],
  ["Victor Petrov", "Phoenix", "victor", ["Pest Control"], 6, 4.2, 310, "rejected"],
  ["Hana Sato", "San Diego", "hana", ["Air Conditioning"], 7, 4.9, 640, "under_review"],
  ["Owen Brady", "Dallas", "owen", ["Carpentry", "Renovations"], 10, 4.6, 1120, "approved"],
  ["Nadia Rahman", "Houston", "nadia", ["Appliance Repair"], 4, 4.8, 205, "pending"],
  ["Luis Ferreira", "Orlando", "luis", ["Electrical"], 13, 4.4, 1490, "blocked"],
];

export const adminTechnicians: AdminTechnician[] = techSeed.map(
  ([name, city, seed, services, experience, rating, jobs, status], i) => ({
    id: `TEC-${1000 + i}`,
    name,
    avatar: avatar(seed),
    email: `${seed}@servicepro.io`,
    phone: `+1 (415) 555-0${100 + i}`,
    city,
    services,
    experience,
    rating,
    jobs,
    revenue: jobs * 84 + i * 137,
    status,
    availability: status === "approved" ? (i % 3 === 0 ? "busy" : "available") : "offline",
    appliedAt: `2026-0${(i % 6) + 1}-${String((i % 27) + 1).padStart(2, "0")}`,
    bank: `•••• ${4000 + i * 7}`,
    employment: i % 4 === 0 ? "Full-time" : "Contractor",
    rejectionReason:
      status === "rejected" ? "Trade certificate expired and police clearance was unreadable." : undefined,
    bio: `${experience} years of field experience across residential and light-commercial work in ${city}.`,
    emergencyContact: `+1 (415) 555-1${100 + i} · Family`,
    serviceAreas: [city, `${city} Metro`, "Surrounding counties"],
    workingHours: "Mon–Sat · 07:00 – 19:00",
    certificates: ["Trade License", "Liability Insurance $1M", "OSHA 30"],
    documents: [
      { name: "Government ID", type: "image/jpeg", uploadedAt: "2026-06-11", verified: status === "approved" },
      { name: "Selfie Verification", type: "image/jpeg", uploadedAt: "2026-06-11", verified: status === "approved" },
      { name: "Trade Certificate", type: "application/pdf", uploadedAt: "2026-06-12", verified: status === "approved" },
      { name: "Police Clearance", type: "application/pdf", uploadedAt: "2026-06-12", verified: status === "approved" },
    ],
  }),
);

export const verificationQueue = adminTechnicians.filter((t) =>
  ["pending", "under_review", "rejected"].includes(t.status),
);
export const pendingVerificationCount = adminTechnicians.filter((t) => t.status === "pending").length;

export type AdminCustomer = {
  id: string;
  name: string;
  avatar: string;
  email: string;
  phone: string;
  city: string;
  bookings: number;
  spend: number;
  joined: string;
  status: "active" | "suspended";
  addresses: string[];
  favouriteTechs: string[];
};

const custSeed = [
  ["Jordan Blake", "Austin", "jordan", 14, 1820],
  ["Rina Patel", "Seattle", "rina", 41, 6120],
  ["Michael Grant", "New York", "michael", 9, 1180],
  ["Elena Torres", "Miami", "elena", 6, 740],
  ["Samir Khan", "Chicago", "samir", 22, 2960],
  ["Chloe Dupont", "Boston", "chloe", 3, 410],
  ["Andre Silva", "Denver", "andre", 18, 2210],
  ["Mei Lin", "San Francisco", "mei", 27, 3840],
  ["Peter Novikov", "Dallas", "peter", 5, 620],
  ["Aisha Bello", "Atlanta", "aisha", 11, 1390],
] as const;

export const adminCustomers: AdminCustomer[] = custSeed.map(([name, city, seed, bookings, spend], i) => ({
  id: `CUS-${2000 + i}`,
  name,
  avatar: avatar(seed),
  email: `${seed}@example.com`,
  phone: `+1 (206) 555-0${200 + i}`,
  city,
  bookings,
  spend,
  joined: `2025-${String((i % 12) + 1).padStart(2, "0")}-14`,
  status: i === 8 ? "suspended" : "active",
  addresses: [`${100 + i * 7} Maple Street, ${city}`, `${20 + i} Harbor Ave, ${city}`],
  favouriteTechs: [adminTechnicians[i % 6].name, adminTechnicians[(i + 2) % 6].name],
}));

export type AdminBooking = {
  id: string;
  customer: string;
  customerAvatar: string;
  technician: string | null;
  technicianAvatar?: string;
  service: string;
  status: BookingStatus;
  date: string;
  time: string;
  amount: number;
  address: string;
  priority: "standard" | "emergency";
  notes: string;
  breakdown: { label: string; value: number }[];
  history: { status: BookingStatus; at: string; by: string }[];
};

const statuses: BookingStatus[] = [
  "pending", "assigned", "accepted", "travelling", "arrived", "working", "completed", "cancelled", "rejected",
];

export const adminBookings: AdminBooking[] = Array.from({ length: 28 }, (_, i) => {
  const status = statuses[i % statuses.length];
  const cust = adminCustomers[i % adminCustomers.length];
  const tech = status === "pending" ? null : adminTechnicians[i % adminTechnicians.length];
  const svc = serviceCatalog[i % serviceCatalog.length];
  const base = svc.price + (i % 5) * 12;
  return {
    id: `BKG-${9000 + i}`,
    customer: cust.name,
    customerAvatar: cust.avatar,
    technician: tech?.name ?? null,
    technicianAvatar: tech?.avatar,
    service: svc.name,
    status,
    date: `2026-07-${String((i % 28) + 1).padStart(2, "0")}`,
    time: `${String(8 + (i % 10)).padStart(2, "0")}:${i % 2 ? "30" : "00"}`,
    amount: base + 35,
    address: cust.addresses[0],
    priority: i % 7 === 0 ? "emergency" : "standard",
    notes: "Customer requested a call 15 minutes before arrival. Gate code #4482.",
    breakdown: [
      { label: "Service call-out", value: base },
      { label: "Parts & materials", value: 22 },
      { label: "Tax", value: 13 },
    ],
    history: [
      { status: "pending", at: "09:02", by: "Website" },
      { status: "assigned", at: "09:07", by: "Dispatch" },
      { status: "accepted", at: "09:11", by: tech?.name ?? "—" },
    ],
  };
});

export type AdminPayment = {
  id: string;
  booking: string;
  customer: string;
  method: string;
  amount: number;
  commission: number;
  tax: number;
  status: "paid" | "pending" | "refunded" | "failed";
  date: string;
};

export const adminPayments: AdminPayment[] = adminBookings.slice(0, 20).map((b, i) => ({
  id: `PAY-${5000 + i}`,
  booking: b.id,
  customer: b.customer,
  method: ["Visa •••• 4242", "Mastercard •••• 8210", "Apple Pay", "Amex •••• 1005"][i % 4],
  amount: b.amount,
  commission: Math.round(b.amount * 0.18),
  tax: Math.round(b.amount * 0.08),
  status: (["paid", "paid", "pending", "refunded", "failed"] as const)[i % 5],
  date: b.date,
}));

export type AdminReview = {
  id: string;
  customer: string;
  customerAvatar: string;
  technician: string;
  service: string;
  rating: number;
  comment: string;
  date: string;
  hidden: boolean;
  reported: boolean;
};

export const adminReviews: AdminReview[] = Array.from({ length: 14 }, (_, i) => {
  const c = adminCustomers[i % adminCustomers.length];
  const t = adminTechnicians[i % 6];
  return {
    id: `REV-${300 + i}`,
    customer: c.name,
    customerAvatar: c.avatar,
    technician: t.name,
    service: serviceCatalog[i % serviceCatalog.length].name,
    rating: [5, 5, 4, 5, 3, 4, 5, 2][i % 8],
    comment: [
      "Arrived early, diagnosed the issue in minutes and left the place spotless.",
      "Very professional and transparent about pricing before starting.",
      "Good work overall, though the arrival window slipped by 20 minutes.",
      "Outstanding. Explained everything and gave maintenance tips.",
      "Job was fine but communication could have been better.",
    ][i % 5],
    date: `2026-07-${String((i % 27) + 1).padStart(2, "0")}`,
    hidden: i === 11,
    reported: i === 7 || i === 11,
  };
});

export type SupportTicket = {
  id: string;
  subject: string;
  requester: string;
  category: "Billing" | "Booking" | "Technician" | "App Issue" | "Other";
  priority: "low" | "medium" | "high" | "urgent";
  status: "open" | "pending" | "resolved" | "closed";
  agent: string;
  updated: string;
  messages: number;
};

export const supportTickets: SupportTicket[] = Array.from({ length: 12 }, (_, i) => ({
  id: `TCK-${700 + i}`,
  subject: [
    "Charged twice for the same booking",
    "Technician never arrived",
    "Cannot upload trade certificate",
    "Refund not received after cancellation",
    "App crashes on job acceptance",
    "Request invoice with company VAT",
  ][i % 6],
  requester: i % 2 ? adminCustomers[i % adminCustomers.length].name : adminTechnicians[i % 6].name,
  category: (["Billing", "Booking", "Technician", "App Issue", "Other"] as const)[i % 5],
  priority: (["urgent", "high", "medium", "low"] as const)[i % 4],
  status: (["open", "pending", "resolved", "closed"] as const)[i % 4],
  agent: ["Dana Whitmore", "Ken Osei", "Marta Silva"][i % 3],
  updated: `${(i % 11) + 1}h ago`,
  messages: 2 + (i % 6),
}));

export type AdminNotification = {
  id: string;
  title: string;
  body: string;
  category: "Booking Updates" | "Approvals" | "Support" | "Payments" | "System Alerts";
  time: string;
  read: boolean;
};

export const adminNotifications: AdminNotification[] = [
  { id: "n1", title: "3 technicians awaiting verification", body: "Tomas Novak, Leila Haddad and Grace Mbeki submitted documents.", category: "Approvals", time: "4 min ago", read: false },
  { id: "n2", title: "Emergency booking created", body: "BKG-9007 · Air Conditioning · Miami — needs dispatch.", category: "Booking Updates", time: "18 min ago", read: false },
  { id: "n3", title: "Payment failed", body: "PAY-5004 for BKG-9004 was declined by the issuer.", category: "Payments", time: "51 min ago", read: false },
  { id: "n4", title: "Review reported", body: "REV-307 was flagged for abusive language.", category: "Support", time: "2 hrs ago", read: true },
  { id: "n5", title: "Nightly export complete", body: "Bookings and payments exports finished successfully.", category: "System Alerts", time: "6 hrs ago", read: true },
  { id: "n6", title: "Technician suspended", body: "James O'Connell was suspended after 2 no-shows.", category: "Approvals", time: "Yesterday", read: true },
];

export const activityFeed = [
  { id: "a1", who: "Dana Whitmore", what: "approved technician", target: "Hana Sato", time: "09:41", tone: "emerald" as Tone },
  { id: "a2", who: "System", what: "auto-assigned booking", target: "BKG-9012", time: "09:28", tone: "blue" as Tone },
  { id: "a3", who: "Ken Osei", what: "issued refund for", target: "PAY-5008", time: "08:55", tone: "amber" as Tone },
  { id: "a4", who: "Marta Silva", what: "rejected application of", target: "Victor Petrov", time: "08:30", tone: "red" as Tone },
  { id: "a5", who: "Dana Whitmore", what: "published CMS update", target: "Homepage hero", time: "08:02", tone: "violet" as Tone },
];

export const revenueSeries = [
  { month: "Jan", revenue: 48200, bookings: 412, customers: 180 },
  { month: "Feb", revenue: 52100, bookings: 448, customers: 214 },
  { month: "Mar", revenue: 61400, bookings: 512, customers: 268 },
  { month: "Apr", revenue: 58900, bookings: 495, customers: 301 },
  { month: "May", revenue: 67300, bookings: 566, customers: 355 },
  { month: "Jun", revenue: 74800, bookings: 618, customers: 402 },
  { month: "Jul", revenue: 81250, bookings: 671, customers: 468 },
];

export const weeklySeries = [
  { day: "Mon", revenue: 9800, bookings: 74 },
  { day: "Tue", revenue: 11200, bookings: 88 },
  { day: "Wed", revenue: 10400, bookings: 81 },
  { day: "Thu", revenue: 12600, bookings: 96 },
  { day: "Fri", revenue: 14100, bookings: 112 },
  { day: "Sat", revenue: 15800, bookings: 128 },
  { day: "Sun", revenue: 7350, bookings: 62 },
];

export const serviceDistribution = [
  { name: "Electrical", value: 412 },
  { name: "Plumbing", value: 388 },
  { name: "Air Conditioning", value: 301 },
  { name: "Deep Cleaning", value: 264 },
  { name: "Appliance Repair", value: 205 },
  { name: "Other", value: 330 },
];

export const upcomingJobs = adminBookings
  .filter((b) => ["assigned", "accepted", "travelling"].includes(b.status))
  .slice(0, 5);

export const calendarEvents = adminBookings.slice(0, 18).map((b, i) => ({
  id: b.id,
  day: (i % 28) + 1,
  title: `${b.service} · ${b.customer.split(" ")[0]}`,
  time: b.time,
  status: b.status,
}));

export const cmsBlocks = [
  { id: "c1", area: "Homepage", title: "Hero headline", value: "Field service, delivered by verified pros.", updated: "2 days ago" },
  { id: "c2", area: "Homepage", title: "Hero subcopy", value: "Book vetted technicians in under 45 minutes, 24/7.", updated: "2 days ago" },
  { id: "c3", area: "Pricing", title: "Emergency plan blurb", value: "24/7 priority dispatch for urgent issues.", updated: "1 week ago" },
  { id: "c4", area: "FAQ", title: "Response time answer", value: "Standard bookings dispatch within 45 minutes in most metros.", updated: "3 weeks ago" },
  { id: "c5", area: "Banners", title: "Site announcement", value: "Now serving 42 metro areas.", updated: "Today" },
  { id: "c6", area: "Legal", title: "Privacy policy", value: "Last reviewed by counsel in June 2026.", updated: "1 month ago" },
];

export const reportCards = [
  { id: "r1", name: "Revenue summary", period: "Jul 2026", value: "$81,250", delta: "+8.6%" },
  { id: "r2", name: "Bookings volume", period: "Jul 2026", value: "671", delta: "+9.1%" },
  { id: "r3", name: "Customer growth", period: "Jul 2026", value: "+66", delta: "+16.4%" },
  { id: "r4", name: "Cancellation rate", period: "Jul 2026", value: "4.2%", delta: "-0.8%" },
  { id: "r5", name: "Avg. rating", period: "Jul 2026", value: "4.82", delta: "+0.04" },
  { id: "r6", name: "Technician utilisation", period: "Jul 2026", value: "78%", delta: "+3.2%" },
];
