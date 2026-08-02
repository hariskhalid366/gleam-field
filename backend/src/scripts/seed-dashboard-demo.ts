import { connectDatabase, disconnectDatabase } from "../config/db.js";
import { logger } from "../config/logger.js";
import { Booking } from "../models/booking.model.js";
import { Payment } from "../models/payment.model.js";
import { Service } from "../models/service.model.js";
import { Technician } from "../models/technician.model.js";
import { User } from "../models/user.model.js";

/** Adds seven days of deterministic demo operations without replacing existing data. */
async function seedDashboardDemo() {
  await connectDatabase();
  const [admin, customers, technicians, services] = await Promise.all([
    User.findOne({ role: { $in: ["admin", "super_admin"] } }),
    User.find({ role: "customer", isActive: true }).limit(10),
    Technician.find({ verificationStatus: "approved", isAvailable: true }).limit(10),
    Service.find({ isActive: true }).limit(10),
  ]);
  if (!admin || !customers.length || !technicians.length || !services.length) throw new Error("Dashboard demo data needs an admin, active customers, approved technicians, and services");

  const today = new Date(); today.setHours(10, 0, 0, 0);
  let inserted = 0;
  for (let dayOffset = 6; dayOffset >= 0; dayOffset -= 1) {
    for (let index = 0; index < 3; index += 1) {
      const date = new Date(today); date.setDate(today.getDate() - dayOffset); date.setHours(9 + index * 3, 0, 0, 0);
      const reference = `DASH-${date.toISOString().slice(0, 10).replaceAll("-", "")}-${index + 1}`;
      let booking = await Booking.findOne({ reference });
      if (!booking) {
        const service = services[(dayOffset + index) % services.length]!;
        const customer = customers[(dayOffset * 3 + index) % customers.length]!;
        const technician = technicians[(dayOffset + index) % technicians.length]!;
        const base = service.basePrice + index * 15;
        const tax = Math.round(base * 0.08);
        booking = await Booking.create({
          reference, customer: customer._id, technician: technician._id, service: service._id,
          status: dayOffset === 0 && index === 2 ? "pending" : "completed", isEmergency: index === 2 && dayOffset % 2 === 0,
          scheduledFor: date, address: { line1: `${120 + index} Dashboard Avenue`, city: customer.city ?? "Austin", postalCode: "78701" },
          price: { base, surcharge: 0, tax, total: base + tax, currency: "USD" },
          timeline: [{ status: "pending", at: date, by: admin._id }, ...(dayOffset === 0 && index === 2 ? [] : [{ status: "completed" as const, at: new Date(date.getTime() + 90 * 60_000), by: admin._id }])],
        });
        await Booking.updateOne({ _id: booking._id }, { $set: { createdAt: date, updatedAt: date } }, { timestamps: false });
        inserted += 1;
      }
      if (booking.status === "completed") {
        await Payment.findOneAndUpdate(
          { booking: booking._id },
          { $setOnInsert: { booking: booking._id, customer: booking.customer, method: "Visa •••• 4242", amount: booking.price.total, commission: Math.round(booking.price.total * 0.18), tax: booking.price.tax, status: "paid", date } },
          { upsert: true, new: true },
        );
      }
    }
  }
  logger.info("Dashboard demo data ready", { insertedBookings: inserted });
  await disconnectDatabase();
}

void seedDashboardDemo().catch(async (error) => {
  logger.error("Failed to seed dashboard demo data", { error: error instanceof Error ? error.message : String(error) });
  await disconnectDatabase().catch(() => undefined);
  process.exit(1);
});
