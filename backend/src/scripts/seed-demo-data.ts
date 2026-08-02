import { connectDatabase, disconnectDatabase } from "../config/db.js";
import { logger } from "../config/logger.js";
import { User } from "../models/user.model.js";
import { Service } from "../models/service.model.js";
import { Technician } from "../models/technician.model.js";
import { Booking, type BookingStatus } from "../models/booking.model.js";
import { Payment } from "../models/payment.model.js";
import { Review } from "../models/review.model.js";
import { SupportTicket } from "../models/supportTicket.model.js";
import { Content } from "../models/content.model.js";

const avatar = (seed: string, size = 160) => `https://i.pravatar.cc/${size}?u=${seed}`;
const password = "DemoPassword123!";

const serviceRows = [
  ["Electrical", "electrical", "Certified electricians for wiring, fixtures, and emergency repairs.", "Home", 49, 99, "60 min"],
  ["Plumbing", "plumbing", "Leak repair, pipe replacement, and installation by licensed plumbers.", "Home", 59, 119, "45 min"],
  ["Air Conditioning", "air-conditioning", "AC installation, servicing, and gas refilling for all major brands.", "Home", 79, 149, "90 min"],
  ["Carpentry", "carpentry", "Custom woodwork, furniture repair, and installations.", "Home", 45, 95, "120 min"],
  ["Painting", "painting", "Interior and exterior painting with premium finishes.", "Home", 120, 180, "1 day"],
  ["Deep Cleaning", "cleaning", "Professional home and office cleaning teams.", "Home", 89, 139, "3 hrs"],
  ["Pest Control", "pest-control", "Safe, effective treatments for all common pests.", "Home", 99, 159, "1 hr"],
  ["Appliance Repair", "appliance-repair", "Fridge, washing machine, oven, microwave and more.", "Home", 69, 129, "60 min"],
  ["Mechanic", "mechanic", "On-site auto mechanics for breakdowns and diagnostics.", "Auto", 89, 169, "75 min"],
  ["Generator Repair", "generator-repair", "Emergency generator servicing and part replacement.", "Home", 129, 199, "1 hr"],
] as const;

const technicianRows = [
  ["Marcus Chen", "San Francisco", "marcus", ["Electrical", "Smart Home"], 9, 4.9, 1240, "approved"],
  ["Amina Yusuf", "Austin", "amina", ["Plumbing", "Water Systems"], 7, 5, 860, "approved"],
  ["Diego Alvarez", "Miami", "diego", ["Air Conditioning", "Refrigeration"], 12, 4.8, 1810, "approved"],
  ["Priya Natarajan", "Seattle", "priya", ["Appliance Repair"], 6, 4.9, 720, "approved"],
  ["James O'Connell", "Boston", "james", ["Carpentry", "Renovations"], 15, 4.7, 2050, "suspended"],
  ["Sofia Rossi", "New York", "sofia", ["Painting", "Finishes"], 8, 4.9, 940, "approved"],
  ["Tomas Novak", "Chicago", "tomas", ["Electrical"], 4, 4.6, 180, "pending"],
  ["Leila Haddad", "Denver", "leila", ["Plumbing", "Water Systems"], 5, 4.8, 240, "pending"],
  ["Ryan Whitfield", "Portland", "ryan", ["Mechanic"], 11, 4.5, 990, "under_review"],
  ["Grace Mbeki", "Atlanta", "grace", ["Deep Cleaning"], 3, 4.7, 130, "pending"],
  ["Victor Petrov", "Phoenix", "victor", ["Pest Control"], 6, 4.2, 310, "rejected"],
  ["Hana Sato", "San Diego", "hana", ["Air Conditioning"], 7, 4.9, 640, "under_review"],
  ["Owen Brady", "Dallas", "owen", ["Carpentry", "Renovations"], 10, 4.6, 1120, "approved"],
  ["Nadia Rahman", "Houston", "nadia", ["Appliance Repair"], 4, 4.8, 205, "pending"],
  ["Luis Ferreira", "Orlando", "luis", ["Electrical"], 13, 4.4, 1490, "suspended"],
] as const;

const customerRows = [
  ["Jordan Blake", "Austin", "jordan", 14, 1820], ["Rina Patel", "Seattle", "rina", 41, 6120],
  ["Michael Grant", "New York", "michael", 9, 1180], ["Elena Torres", "Miami", "elena", 6, 740],
  ["Samir Khan", "Chicago", "samir", 22, 2960], ["Chloe Dupont", "Boston", "chloe", 3, 410],
  ["Andre Silva", "Denver", "andre", 18, 2210], ["Mei Lin", "San Francisco", "mei", 27, 3840],
  ["Peter Novikov", "Dallas", "peter", 5, 620], ["Aisha Bello", "Atlanta", "aisha", 11, 1390],
] as const;

const publicContent = {
  heroHeadline: "Reliable home services, delivered by verified pros.",
  heroSubcopy: "Book trusted electricians, plumbers, AC technicians, mechanics, and more in just a few clicks — with live tracking, transparent pricing, and 24/7 emergency dispatch.",
  siteAnnouncement: "Now serving 42 metros",
  privacyNotice: "Last reviewed by counsel in June 2026.",
  testimonials: [
    { id: 1, name: "Jordan Blake", role: "Homeowner, Austin", avatar: avatar("jordan", 240), rating: 5, quote: "Booked a plumber at 9pm on a Sunday. Amina arrived in 35 minutes, fixed the leak, and cleaned up. It felt like magic." },
    { id: 2, name: "Rina Patel", role: "Property Manager, Seattle", avatar: avatar("rina", 240), rating: 5, quote: "We manage 40 units. ServicePro replaced three vendors — the SLA reporting alone is worth it." },
    { id: 3, name: "Michael Grant", role: "Small Business Owner, NYC", avatar: avatar("michael", 240), rating: 5, quote: "The technician quality is genuinely a step above. Vetted, insured, and they actually show up on time." },
    { id: 4, name: "Elena Torres", role: "Homeowner, Miami", avatar: avatar("elena", 240), rating: 4, quote: "The live tracking took the anxiety out of waiting. I could plan my afternoon around a real ETA." },
  ],
  trustedCompanies: ["Northwind", "Acme Realty", "Contoso", "Globex", "Initech", "Umbrella", "Wayne Enterprises"],
  pricingPlans: [
    { id: "basic", name: "Basic Visit", price: 49, cadence: "per visit", description: "Single service call with a verified technician.", features: ["60-min service window", "Verified & insured pro", "In-app messaging", "30-day workmanship warranty"], recommended: false },
    { id: "emergency", name: "Emergency Visit", price: 129, cadence: "per visit", description: "24/7 priority dispatch for urgent issues.", features: ["Under 60-min response", "Priority routing", "24/7 availability", "Weekend & holiday coverage", "Live GPS tracking"], recommended: true },
    { id: "annual", name: "Annual Maintenance", price: 39, cadence: "per month", description: "Quarterly preventive visits plus discounted repairs.", features: ["4 visits per year", "15% off all repairs", "Priority booking", "Seasonal HVAC tune-up", "Dedicated account manager"], recommended: false },
  ],
  faqs: [
    ["How quickly can a technician arrive?", "Standard bookings are dispatched within 45 minutes in most metro areas. Emergency service targets under 60 minutes, 24/7."],
    ["Are your technicians insured and background-checked?", "Every ServicePro technician passes identity verification, a background check, license validation, and carries $1M liability insurance."],
    ["How is pricing determined?", "You see a starting rate before booking. Final pricing is confirmed on-site with a written estimate — never charged without your approval."],
    ["What areas do you serve?", "We operate in 42 US metro areas and are expanding monthly. Enter your postal code at checkout to confirm availability."],
    ["Do you offer a warranty?", "Yes — all workmanship is covered by a 30-day guarantee. Annual plan members receive a 90-day guarantee."],
    ["Can I choose my technician?", "Absolutely. Browse verified profiles, ratings, and specializations, and request a specific pro at booking."],
    ["How do payments work?", "Cards are authorized at booking and charged only after service completion. We accept Visa, Mastercard, Amex, and Apple Pay."],
    ["What happens if I need to cancel?", "Cancel free up to 2 hours before your scheduled window. Late cancellations incur a small dispatch fee."],
    ["Do you handle commercial properties?", "Yes — our Business plan supports multi-site accounts, invoicing, and SLA reporting."],
    ["How do I become a ServicePro technician?", "Apply from the Become a Technician page. You'll need a valid trade license, ID, insurance, and a smartphone."],
  ].map(([q, a]) => ({ q, a })),
};

const whyUsContent = {
  eyebrow: "Why us",
  title: "Enterprise-grade trust.",
  emphasizedTitle: "Consumer-grade ease.",
  description: "We built ServicePro for the standards of a Fortune 500 facilities team, with an experience simple enough for a first-time homeowner.",
  values: [
    ["shield-check", "Verified professionals", "Every pro is background-checked, license-verified, and $1M insured."],
    ["map-pin", "Real-time tracking", "Live GPS from dispatch to doorstep."],
    ["lock", "Secure payments", "Cards authorized at booking, only charged on completion."],
    ["headphones", "24/7 support", "Real humans on call, every hour."],
    ["sparkles", "Transparent pricing", "Starting rates upfront, written estimate on-site."],
    ["award", "Warrantied work", "30-day workmanship warranty on every job."],
    ["users", "Enterprise-ready", "Multi-site accounts, SLA reporting, invoicing."],
    ["check", "Instant dispatch", "Average 42 min response in metro areas."],
  ].map(([icon, title, description]) => ({ icon, title, description })),
  metrics: [["500+", "Verified pros"], ["42", "Metros served"], ["4.9★", "Avg rating"], ["<60min", "Emergency ETA"]].map(([value, label]) => ({ value, label })),
};

async function replaceContent(key: string, scope: "public" | "admin" | "system", data: unknown) {
  await Content.findOneAndUpdate({ key }, { key, scope, data }, { upsert: true, new: true, runValidators: true });
}

async function seed() {
  await connectDatabase();

  const reset = process.argv.includes("--reset");
  const existingRecords = await Promise.all([
    User.countDocuments(), Service.countDocuments(), Booking.countDocuments(), Content.countDocuments(),
  ]);
  if (existingRecords.some(Boolean) && !reset) {
    throw new Error("The database already contains data. Use `npm run seed:reset` only when replacing it is intended.");
  }
  if (reset) {
    // The explicit reset mode makes the seed deterministic without ever deleting by default.
    await Promise.all([
      Payment.deleteMany({}), Review.deleteMany({}), SupportTicket.deleteMany({}), Booking.deleteMany({}),
      Technician.deleteMany({}), Service.deleteMany({}), User.deleteMany({}), Content.deleteMany({}),
    ]);
  }

  const admin = await User.create({ name: "Alex Rivera", email: "admin@servicepro.com", password, role: "admin", isActive: true });
  const services = await Service.insertMany(serviceRows.map(([name, slug, description, category, basePrice, emergencyPrice, estimatedDuration], index) => ({
    name, slug, description, category, basePrice, emergencyPrice, estimatedDuration, icon: `service-${slug}`, isActive: slug !== "pest-control",
    included: ["Diagnostic and written estimate before work begins", "Verified, insured technician", "All standard parts and materials", "Clean-up and haul-away", "30-day workmanship warranty"],
    legacyId: `s${index + 1}`,
  })));

  const customers = await Promise.all(customerRows.map(async ([name, city, seedName]) => User.create({
    name, email: `${seedName}@example.com`, phone: `+1 (206) 555-0${200 + customersIndex(seedName)}`, city, avatarUrl: avatar(seedName), password, role: "customer", isActive: seedName !== "peter",
  })));

  const technicianUsers = await Promise.all(technicianRows.map(async ([name, city, seedName]) => User.create({
    name, email: `${seedName}@servicepro.io`, phone: `+1 (415) 555-0${100 + techniciansIndex(seedName)}`, city, avatarUrl: avatar(seedName), password, role: "technician", isActive: true,
  })));
  const technicianProfiles = await Promise.all(technicianRows.map(async ([name, city, seedName, skills, experienceYears, rating, jobsCompleted, verificationStatus], index) => Technician.create({
    user: technicianUsers[index]!._id, city, services: skills, experienceYears, rating, jobsCompleted,
    hourlyRate: 55 + (index % 5) * 5, verificationStatus, isAvailable: verificationStatus === "approved",
    bio: `${experienceYears} years of field experience across residential and light-commercial work in ${city}.`,
    documents: ["id_card", "certificate", "insurance", "background_check"].map((kind) => ({ kind, url: `/seed/${seedName}/${kind}.pdf`, verified: verificationStatus === "approved" })),
  })));

  const mockBookings = await Promise.all(Array.from({ length: 28 }, async (_, index) => {
    const rawStatus = ["pending", "assigned", "accepted", "travelling", "arrived", "working", "completed", "cancelled", "rejected"][index % 9];
    const status: BookingStatus = rawStatus === "arrived" || rawStatus === "working" ? "in_progress" : rawStatus === "rejected" ? "cancelled" : rawStatus as BookingStatus;
    const service = services[index % 9]!;
    const customer = customers[index % customers.length]!;
    const technician = rawStatus === "pending" ? undefined : technicianProfiles[index % technicianProfiles.length]!;
    const base = service.basePrice + (index % 5) * 12;
    const isEmergency = index % 7 === 0;
    const date = new Date(`2026-07-${String((index % 28) + 1).padStart(2, "0")}T${String(8 + (index % 10)).padStart(2, "0")}:${index % 2 ? "30" : "00"}:00.000Z`);
    return Booking.create({
      reference: `BKG-${9000 + index}`, customer: customer._id, technician: technician?._id, service: service._id, status, isEmergency,
      scheduledFor: date, address: { line1: `${100 + (index % 10) * 7} Maple Street`, city: customer.city, notes: "Customer requested a call 15 minutes before arrival. Gate code #4482." },
      price: { base, surcharge: isEmergency ? 35 : 0, tax: 13, total: base + 35, currency: "USD" },
      timeline: [{ status: "pending", at: date, by: admin._id }, ...(status !== "pending" ? [{ status, at: date, by: admin._id }] : [])],
    });
  }));

  await Payment.insertMany(mockBookings.slice(0, 20).map((booking, index) => ({
    booking: booking._id, customer: booking.customer, method: ["Visa •••• 4242", "Mastercard •••• 8210", "Apple Pay", "Amex •••• 1005"][index % 4],
    amount: booking.price.total, commission: Math.round(booking.price.total * 0.18), tax: Math.round(booking.price.total * 0.08), status: ["paid", "paid", "pending", "refunded", "failed"][index % 5], date: booking.scheduledFor,
  })));
  await Review.insertMany(Array.from({ length: 14 }, (_, index) => ({
    booking: mockBookings[index]!, customer: customers[index % customers.length]!._id, technician: technicianProfiles[index % 6]!._id,
    rating: [5, 5, 4, 5, 3, 4, 5, 2][index % 8], comment: ["Arrived early, diagnosed the issue in minutes and left the place spotless.", "Very professional and transparent about pricing before starting.", "Good work overall, though the arrival window slipped by 20 minutes.", "Outstanding. Explained everything and gave maintenance tips.", "Job was fine but communication could have been better."][index % 5],
    isHidden: index === 11, isReported: index === 7 || index === 11,
  })));
  await SupportTicket.insertMany(Array.from({ length: 12 }, (_, index) => ({
    subject: ["Charged twice for the same booking", "Technician never arrived", "Cannot upload trade certificate", "Refund not received after cancellation", "App crashes on job acceptance", "Request invoice with company VAT"][index % 6],
    category: ["Billing", "Booking", "Technician", "App Issue", "Other"][index % 5], priority: ["urgent", "high", "medium", "low"][index % 4], status: ["open", "pending", "resolved", "closed"][index % 4],
    requester: index % 2 ? customers[index % customers.length]!._id : technicianUsers[index % 6]!._id, agent: ["Dana Whitmore", "Ken Osei", "Marta Silva"][index % 3], messages: [{ sender: admin._id, text: `Seeded support message ${index + 1}` }],
  })));

  await replaceContent("public.site", "public", publicContent);
  await replaceContent("public.why-us", "public", whyUsContent);
  await replaceContent("admin.cms-blocks", "admin", [
    ["Homepage", "Hero headline", "Field service, delivered by verified pros."], ["Homepage", "Hero subcopy", "Book vetted technicians in under 45 minutes, 24/7."], ["Pricing", "Emergency plan blurb", "24/7 priority dispatch for urgent issues."], ["FAQ", "Response time answer", "Standard bookings dispatch within 45 minutes in most metros."], ["Banners", "Site announcement", "Now serving 42 metro areas."], ["Legal", "Privacy policy", "Last reviewed by counsel in June 2026."],
  ].map(([area, title, value], index) => ({ id: `c${index + 1}`, area, title, value })));
  await replaceContent("admin.notifications", "admin", [
    ["3 technicians awaiting verification", "Tomas Novak, Leila Haddad and Grace Mbeki submitted documents.", "Approvals", false], ["Emergency booking created", "BKG-9007 · Air Conditioning · Miami — needs dispatch.", "Booking Updates", false], ["Payment failed", "PAY-5004 for BKG-9004 was declined by the issuer.", "Payments", false], ["Review reported", "REV-307 was flagged for abusive language.", "Support", true], ["Nightly export complete", "Bookings and payments exports finished successfully.", "System Alerts", true], ["Technician suspended", "James O'Connell was suspended after 2 no-shows.", "Approvals", true],
  ].map(([title, body, category, read], index) => ({ id: `n${index + 1}`, title, body, category, read })));
  await replaceContent("admin.reporting", "admin", {
    revenueSeries: [["Jan", 48200, 412, 180], ["Feb", 52100, 448, 214], ["Mar", 61400, 512, 268], ["Apr", 58900, 495, 301], ["May", 67300, 566, 355], ["Jun", 74800, 618, 402], ["Jul", 81250, 671, 468]].map(([month, revenue, bookings, customers]) => ({ month, revenue, bookings, customers })),
    weeklySeries: [["Mon", 9800, 74], ["Tue", 11200, 88], ["Wed", 10400, 81], ["Thu", 12600, 96], ["Fri", 14100, 112], ["Sat", 15800, 128], ["Sun", 7350, 62]].map(([day, revenue, bookings]) => ({ day, revenue, bookings })),
    serviceDistribution: [["Electrical", 412], ["Plumbing", 388], ["Air Conditioning", 301], ["Deep Cleaning", 264], ["Appliance Repair", 205], ["Other", 330]].map(([name, value]) => ({ name, value })),
  });
  await replaceContent("admin.activity", "admin", [
    ["Dana Whitmore", "approved technician", "Hana Sato", "09:41", "emerald"], ["System", "auto-assigned booking", "BKG-9012", "09:28", "blue"], ["Ken Osei", "issued refund for", "PAY-5008", "08:55", "amber"], ["Marta Silva", "rejected application of", "Victor Petrov", "08:30", "red"], ["Dana Whitmore", "published CMS update", "Homepage hero", "08:02", "violet"],
  ].map(([who, what, target, time, tone], index) => ({ id: `a${index + 1}`, who, what, target, time, tone })));
  await replaceContent("system.seed-info", "system", { seededAt: new Date().toISOString(), admin: { email: "admin@servicepro.com", password }, counts: { services: services.length, customers: customers.length, technicians: technicianProfiles.length, bookings: mockBookings.length } });

  logger.info("Demo data seeded", { services: services.length, customers: customers.length, technicians: technicianProfiles.length, bookings: mockBookings.length });
  await disconnectDatabase();
}

function customersIndex(seed: string) { return customerRows.findIndex((row) => row[2] === seed); }
function techniciansIndex(seed: string) { return technicianRows.findIndex((row) => row[2] === seed); }

void seed().catch(async (error) => {
  logger.error("Failed to seed demo data", { error: error instanceof Error ? error.message : String(error) });
  await disconnectDatabase().catch(() => undefined);
  process.exit(1);
});
