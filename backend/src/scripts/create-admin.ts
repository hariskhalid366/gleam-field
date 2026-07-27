import { User } from "../models/user.model.js";
import { connectDatabase, disconnectDatabase } from "../config/db.js";
import { logger } from "../config/logger.js";

async function createAdmin() {
  await connectDatabase();

  const adminEmail = "admin@servicepro.com";
  const adminPassword = "AdminPassword123!";

  const existing = await User.findOne({ email: adminEmail });
  if (existing) {
    logger.info(`An admin account with email "${adminEmail}" already exists!`);
    await disconnectDatabase();
    process.exit(0);
  }

  await User.create({
    name: "Business Administrator",
    email: adminEmail,
    password: adminPassword,
    role: "admin",
    isActive: true,
  });

  logger.info("====================================================");
  logger.info("SUCCESS: Default Admin User Created Successfully!");
  logger.info("----------------------------------------------------");
  logger.info(`Email:    ${adminEmail}`);
  logger.info(`Password: ${adminPassword}`);
  logger.info("====================================================");

  await disconnectDatabase();
  process.exit(0);
}

void createAdmin().catch((err) => {
  logger.error("Failed to create admin user:", err);
  process.exit(1);
});
