/* eslint-disable no-console */
import mongoose from "mongoose";
import { connectDatabase, disconnectDatabase } from "../config/db.js";
import { User } from "../models/user.model.js";
import { Technician } from "../models/technician.model.js";
import { Service } from "../models/service.model.js";
import { Booking } from "../models/booking.model.js";
import { Payment } from "../models/payment.model.js";
import { Review } from "../models/review.model.js";
import { SupportTicket } from "../models/supportTicket.model.js";
import { CmsBlock } from "../models/cmsBlock.model.js";
import { Setting } from "../models/setting.model.js";
import { NotificationTemplate } from "../models/notification.model.js";

const SERVICES = [
  { name: "Electrical", slug: "electrical", basePrice: 89, emergencyPrice: 149, estimatedDuration: "1-2 hrs" },
  { name: "Plumbing", slug: "plumbing", basePrice: 79, emergencyPrice: 139, estimatedDuration: "1-3 hrs" },
  { name: "AC & Heating", slug: "ac-heating", basePrice: 119, emergencyPrice: 189, estimatedDuration: "2-4 hrs" },
  { name: "Carpentry", slug: "carpentry", basePrice: 69, emergencyPrice: 119, estimatedDuration: "2-5 hrs" },
  { name: "Painting", slug: "painting", basePrice: 59, emergencyPrice: 99, estimatedDuration: "4-8 hrs" },
  { name: "Cleaning", slug: "cleaning", basePrice: 49, emergencyPrice: 89, estimatedDuration: "2-4 hrs" },
];

const CITIES = ["Austin", "Dallas", "Houston", "Phoenix", "Denver"];
const PASSWORD = process.env.SEED_PASSWORD ?? "ServicePro123";

function pick<T>(arr: T[], i: number): T {
  return arr[i % arr.length] as T;
}

function daysAgo(n: number) {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000);
}

async function seed() {
  await connectDatabase();
  console.log("Seeding ServicePro data…");

  await Promise.all([
    User.deleteMany({}),
    Technician.deleteMany({}),
    Service.deleteMany({}),
    Booking.deleteMany({}),
    Payment.deleteMany({}),
    Review.deleteMany({}),
    SupportTicket.deleteMany({}),
    CmsBlock.deleteMany({}),
    Setting.deleteMany({}),
    NotificationTemplate.deleteMany({}),
  ]);

  const services = await Service.create(
    SERVICES.map((s) => ({ ...s, description: `Professional ${s.name.toLowerCase()} services from vetted pros.`, isActive: true })),
  );

  const admin = await User.create({
    name: "Sarah Chen",
    email: "admin@servicepro.com",
    password: PASSWORD,
    role: "super_admin",
    city: "Austin",
    isEmailVerified: true,
  });

  const customers = await User.create(
    Array.from({ length: 12 }, (_, i) => ({
      name: `Customer ${i + 1}`,
      email: `customer${i + 1}@example.com`,
      phone: `+1555000${String(i + 1).padStart(4, "0")}`,
      password: PASSWORD,
      role: "customer" as const,
      city: pick(CITIES, i),
      isEmailVerified: true,
    })),
  );

  const techUsers = await User.create(
    Array.from({ length: 8 }, (_, i) => ({
      name: `Technician ${i + 1}`,
      email: `tech${i + 1}@example.com`,
      phone: `+1555111${String(i + 1).padStart(4, "0")}`,
      password: PASSWORD,
      role: "technician" as const,
      city: pick(CITIES, i),
      isEmailVerified: true,
    })),
  );

  const technicians = await Technician.create(
    techUsers.map((u, i) => ({
      user: u._id,
      city: pick(CITIES, i),
      bio: "Licensed, insured and background-checked field professional.",
      services: [pick(SERVICES, i).slug],
      experienceYears: 2 + (i % 12),
      hourlyRate: 45 + i * 5,
      rating: Number((4 + (i % 10) / 10).toFixed(1)),
      jobsCompleted: 20 + i * 13,
      // Two applicants stay in the queue so the verification screen has work to do.
      verificationStatus: i < 6 ? ("approved" as const) : ("pending" as const),
      documents:
        i >= 6
          ? [{ kind: "id_card" as const, url: "https://files.servicepro.test/sample-id.pdf", uploadedAt: new Date(), verified: false }]
          : [],
    })),
  );

  const approved = technicians.filter((t) => t.verificationStatus === "approved");
  const statuses = ["completed", "completed", "completed", "in_progress", "assigned", "pending", "cancelled"] as const;

  const bookings = [];
  for (let i = 0; i < 40; i += 1) {
    const service = pick(services, i);
    const customer = pick(customers, i);
    const status = pick([...statuses], i);
    const isEmergency = i % 7 === 0;
    const base = isEmergency ? service.emergencyPrice : service.basePrice;
    const surcharge = isEmergency ? 25 : 0;
    const tax = Number(((base + surcharge) * 0.08).toFixed(2));

    bookings.push({
      reference: `SP-${String(1000 + i)}`,
      customer: customer._id,
      technician: status === "pending" ? undefined : pick(approved, i)._id,
      service: service._id,
      status,
      isEmergency,
      scheduledFor: new Date(Date.now() + (i % 14) * 86400000 - (i > 20 ? 30 * 86400000 : 0)),
      address: { line1: `${100 + i} Main St`, city: customer.city ?? "Austin", postalCode: "78701" },
      price: { base, surcharge, tax, total: Number((base + surcharge + tax).toFixed(2)), currency: "USD" },
      timeline: [{ status: "pending" as const, at: daysAgo(30 - (i % 30)) }],
      createdAt: daysAgo(180 - i * 4),
    });
  }
  // Raw collection insert keeps the seeded createdAt spread — reports need history.
  await Booking.collection.insertMany(bookings.map((b) => ({ ...b, updatedAt: b.createdAt })) as never[]);

  const createdBookings = await Booking.find().sort({ reference: 1 }).lean();

  await Payment.create(
    createdBookings
      .filter((b) => b.status === "completed" || b.status === "in_progress")
      .map((b, i) => ({
        booking: b._id,
        customer: b.customer,
        method: i % 3 === 0 ? "Visa •••• 4242" : "Mastercard •••• 8210",
        amount: b.price.total,
        commission: Number((b.price.total * 0.15).toFixed(2)),
        tax: b.price.tax,
        status: b.status === "completed" ? ("paid" as const) : ("pending" as const),
        date: b.scheduledFor,
      })),
  );

  const completed = createdBookings.filter((b) => b.status === "completed").slice(0, 10);
  await Review.create(
    completed.map((b, i) => ({
      booking: b._id,
      customer: b.customer,
      technician: b.technician,
      service: b.service,
      rating: 4 + (i % 2),
      comment: "Arrived on time, explained everything clearly and left the place spotless.",
      isHidden: false,
    })),
  );

  await SupportTicket.create([
    {
      subject: "Refund not received",
      category: "Billing",
      priority: "high",
      status: "open",
      requester: pick(customers, 0)._id,
      messages: [{ sender: pick(customers, 0)._id, text: "My refund for SP-1003 hasn't arrived yet.", createdAt: new Date() }],
    },
    {
      subject: "Technician was late",
      category: "Booking",
      priority: "medium",
      status: "pending",
      requester: pick(customers, 1)._id,
      messages: [{ sender: pick(customers, 1)._id, text: "The pro showed up 40 minutes late.", createdAt: new Date() }],
    },
  ]);

  await CmsBlock.create([
    {
      key: "home.hero",
      page: "home",
      title: "Homepage hero",
      content: { heading: "Field service, handled.", sub: "Book verified pros in minutes.", cta: "Book a service" },
    },
    { key: "home.stats", page: "home", title: "Homepage stats", content: { jobs: "48,000+", pros: "1,200+", rating: "4.9" } },
    { key: "pricing.note", page: "pricing", title: "Pricing footnote", content: { text: "All prices exclude parts and local taxes." } },
  ]);

  await Setting.create([
    { scope: "business", values: { companyName: "ServicePro", currency: "USD", timezone: "America/Chicago", taxRate: 8 } },
    { scope: "payments", values: { commissionRate: 15, payoutSchedule: "weekly", minimumPayout: 50 } },
    { scope: "security", values: { require2faForAdmins: true, sessionTimeoutMinutes: 30 } },
  ]);

  await NotificationTemplate.create([
    {
      key: "technician.approved",
      name: "Technician approved",
      subject: "You're approved, {{name}}!",
      body: "Congratulations {{name}} — your ServicePro application has been approved.",
      channels: ["in_app", "email"],
    },
    {
      key: "booking.status",
      name: "Booking status change",
      subject: "Booking {{reference}} is now {{status}}",
      body: "Your booking {{reference}} has moved to {{status}}.",
      channels: ["in_app", "push"],
    },
  ]);

  console.log(`Seeded: ${services.length} services, ${customers.length} customers, ${technicians.length} technicians, ${createdBookings.length} bookings.`);
  console.log(`Admin login: ${admin.email} / ${PASSWORD}`);

  await disconnectDatabase();
  await mongoose.connection.close();
}

seed().catch(async (err) => {
  console.error(err);
  process.exit(1);
});
