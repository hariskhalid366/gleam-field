import { test, before, after, describe } from "node:test";
import assert from "node:assert";
import mongoose from "mongoose";
import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";

// 1. Set environment variables BEFORE importing our app modules so they pass the Zod validation
let mongoServer: MongoMemoryServer;

before(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  process.env.NODE_ENV = "test";
  process.env.MONGODB_URI = uri;
  process.env.JWT_ACCESS_SECRET = "supersecretaccesskey_must_be_at_least_32_characters_long";
  process.env.JWT_REFRESH_SECRET = "supersecretrefreshkey_must_be_at_least_32_characters_long";
  process.env.PORT = "4500";
});

describe("ServicePro API Security & Integration Tests", () => {
  let app: any;
  let registerResponse: any;
  let adminToken: string;
  let adminUserInstance: any;

  before(async () => {
    // Import inside before hook to ensure environment variables are already set
    const { createApp } = await import("../app.js");
    const { connectDatabase } = await import("../config/db.js");
    const { User } = await import("../models/user.model.js");

    await connectDatabase();
    app = createApp();

    // Create an admin user directly in the database for admin route testing
    adminUserInstance = await User.create({
      name: "System Admin",
      email: "admin@servicepro.io",
      password: "AdminPassword123!",
      role: "admin",
      isActive: true,
    });
  });

  after(async () => {
    const { disconnectDatabase } = await import("../config/db.js");
    await disconnectDatabase();
    await mongoServer.stop();
  });

  describe("1. Liveness & Connectivity Endpoints", () => {
    test("GET /health should return 200 and report database connectivity status", async () => {
      const res = await request(app)
        .get("/api/v1/health")
        .expect(200);

      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.status, "ok");
      assert.strictEqual(res.body.database, "connected");
    });
  });

  describe("2. Authentication and Zod Input Validation", () => {
    test("POST /auth/register should fail on a weak password (less than 10 chars, missing uppercase/numbers)", async () => {
      const res = await request(app)
        .post("/api/v1/auth/register")
        .send({
          name: "John Doe",
          email: "john@example.com",
          password: "weak",
          phone: "+123456789",
          city: "Seattle"
        })
        .expect(400);

      assert.strictEqual(res.body.success, false);
      assert.ok(res.body.errors);
    });

    test("POST /auth/register should succeed with a strong password", async () => {
      const res = await request(app)
        .post("/api/v1/auth/register")
        .send({
          name: "John Doe",
          email: "john@example.com",
          password: "StrongPassword123!",
          phone: "+123456789",
          city: "Seattle"
        })
        .expect(201);

      assert.strictEqual(res.body.success, true);
      assert.ok(res.body.data.accessToken);
      assert.ok(res.body.data.refreshToken);
      assert.strictEqual(res.body.data.user.email, "john@example.com");
      assert.strictEqual(res.body.data.user.role, "customer");
      // Verify password hash is never leaked in the response JSON
      assert.strictEqual(res.body.data.user.password, undefined);

      registerResponse = res.body.data;
    });

    test("POST /auth/register should enforce email uniqueness", async () => {
      const res = await request(app)
        .post("/api/v1/auth/register")
        .send({
          name: "John Duplicate",
          email: "john@example.com",
          password: "StrongPassword123!",
          phone: "+123456789",
          city: "Seattle"
        })
        .expect(409); // Conflict

      assert.strictEqual(res.body.success, false);
    });

    test("POST /auth/login should authenticate with correct credentials", async () => {
      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({
          email: "john@example.com",
          password: "StrongPassword123!"
        })
        .expect(200);

      assert.strictEqual(res.body.success, true);
      assert.ok(res.body.data.accessToken);
      assert.ok(res.body.data.refreshToken);
    });

    test("POST /auth/login should reject incorrect credentials", async () => {
      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({
          email: "john@example.com",
          password: "WrongPassword999!"
        })
        .expect(401);

      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.message, "Invalid email or password");
    });

    test("POST /auth/login should authenticate admin user successfully", async () => {
      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({
          email: "admin@servicepro.io",
          password: "AdminPassword123!"
        })
        .expect(200);

      assert.strictEqual(res.body.success, true);
      assert.ok(res.body.data.accessToken);
      adminToken = res.body.data.accessToken;
    });
  });

  describe("3. Authorization and Protected Routes Verification", () => {
    test("GET /auth/me should fail without authorization header (415 or 401)", async () => {
      const res = await request(app)
        .get("/api/v1/auth/me")
        .expect(401);

      assert.strictEqual(res.body.success, false);
    });

    test("GET /auth/me should succeed with a valid Bearer token", async () => {
      const res = await request(app)
        .get("/api/v1/auth/me")
        .set("Authorization", `Bearer ${registerResponse.accessToken}`)
        .expect(200);

      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.data.user.email, "john@example.com");
    });

    test("POST /services should fail for a regular customer (admin access only)", async () => {
      const res = await request(app)
        .post("/api/v1/services")
        .set("Authorization", `Bearer ${registerResponse.accessToken}`)
        .send({
          name: "Plumbing Service",
          slug: "plumbing-service",
          description: "Leaky pipe repair",
          basePrice: 100,
          emergencyPrice: 150
        })
        .expect(403); // Forbidden

      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.message, "Insufficient role permissions");
    });
  });

  describe("4. Support Tickets Subsystem", () => {
    let ticketId: string;

    test("POST /support/tickets should open a support ticket for customer", async () => {
      const res = await request(app)
        .post("/api/v1/support/tickets")
        .set("Authorization", `Bearer ${registerResponse.accessToken}`)
        .send({
          subject: "Charged twice for service",
          category: "Billing",
          priority: "high",
          message: "Please refund the duplicate payment."
        })
        .expect(201);

      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.data.subject, "Charged twice for service");
      assert.strictEqual(res.body.data.category, "Billing");
      assert.strictEqual(res.body.data.status, "open");
      assert.strictEqual(res.body.data.messages.length, 1);
      assert.strictEqual(res.body.data.messages[0].text, "Please refund the duplicate payment.");

      ticketId = res.body.data._id;
    });

    test("GET /support/tickets should retrieve support ticket for the owner", async () => {
      const res = await request(app)
        .get("/api/v1/support/tickets")
        .set("Authorization", `Bearer ${registerResponse.accessToken}`)
        .expect(200);

      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.meta.total, 1);
      assert.strictEqual(res.body.data[0]._id, ticketId);
    });

    test("POST /support/tickets/:id/messages should add message replies", async () => {
      const res = await request(app)
        .post(`/api/v1/support/tickets/${ticketId}/messages`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ text: "Checking this. Let me verify with our gateway." })
        .expect(200);

      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.data.messages.length, 2);
      assert.strictEqual(res.body.data.messages[1].text, "Checking this. Let me verify with our gateway.");
    });
  });

  describe("5. Admin Platform Operations (Users, Payments, Stats)", () => {
    test("GET /users should list registered accounts for admins only", async () => {
      // Admin should succeed
      const res = await request(app)
        .get("/api/v1/users")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      assert.strictEqual(res.body.success, true);
      assert.ok(res.body.meta.total >= 2); // Admin and Customer

      // Customer should be forbidden
      await request(app)
        .get("/api/v1/users")
        .set("Authorization", `Bearer ${registerResponse.accessToken}`)
        .expect(403);
    });

    test("PATCH /users/:id/status should suspend an isolated account and revoke its active session families", async () => {
      // Create a separate user strictly for suspension test so we don't invalidate our main customer token version
      const registerRes = await request(app)
        .post("/api/v1/auth/register")
        .send({
          name: "Suspend Test User",
          email: "suspend-test@example.com",
          password: "StrongPassword123!",
          phone: "+111222333",
          city: "New York"
        })
        .expect(201);

      const testUserId = registerRes.body.data.user._id;
      const testUserAccessToken = registerRes.body.data.accessToken;

      // 1. Verify they are active and can call `/auth/me`
      await request(app)
        .get("/api/v1/auth/me")
        .set("Authorization", `Bearer ${testUserAccessToken}`)
        .expect(200);

      // 2. Suspend them
      const res = await request(app)
        .patch(`/api/v1/users/${testUserId}/status`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ isActive: false })
        .expect(200);

      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.data.isActive, false);

      // 3. Verify that accessing `/auth/me` with their accessToken now fails as session is revoked
      await request(app)
        .get("/api/v1/auth/me")
        .set("Authorization", `Bearer ${testUserAccessToken}`)
        .expect(401);
    });

    test("GET /payments should list transaction reports", async () => {
      // No payments created yet, should return empty array
      const res = await request(app)
        .get("/api/v1/payments")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.meta.total, 0);
    });

    test("GET /admin/stats should aggregate analytics", async () => {
      const res = await request(app)
        .get("/api/v1/admin/stats")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      assert.strictEqual(res.body.success, true);
      assert.strictEqual(typeof res.body.data.totalBookings, "number");
      assert.strictEqual(typeof res.body.data.totalCustomers, "number");
      assert.strictEqual(typeof res.body.data.totalRevenue, "number");
    });

    test("GET /admin/dashboard should aggregate dashboard statistics", async () => {
      const res = await request(app)
        .get("/api/v1/admin/dashboard")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      assert.strictEqual(res.body.success, true);
      assert.ok(res.body.data.revenue);
      assert.ok(res.body.data.bookingStats);
      assert.ok(res.body.data.chartSeries);
    });

    test("GET /admin/bookings should list bookings paginated", async () => {
      const res = await request(app)
        .get("/api/v1/admin/bookings")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      assert.strictEqual(res.body.success, true);
      assert.ok(Array.isArray(res.body.data));
    });

    test("GET /admin/calendar should list monthly view events", async () => {
      const res = await request(app)
        .get("/api/v1/admin/calendar")
        .query({ year: 2026, month: 7 })
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      assert.strictEqual(res.body.success, true);
      assert.ok(Array.isArray(res.body.data.events));
    });
  });

  describe("6. Centralized File Upload Subsystem", () => {
    let uploadedFileId: string;

    test("POST /files should upload a valid avatar image file successfully", async () => {
      const buffer = Buffer.from("fake-png-image-data-here");
      const res = await request(app)
        .post("/api/v1/files")
        .set("Authorization", `Bearer ${registerResponse.accessToken}`)
        .query({ purpose: "avatar" })
        .attach("file", buffer, "profile.png")
        .expect(201);

      assert.strictEqual(res.body.success, true);
      assert.ok(res.body.data.fileId);
      assert.strictEqual(res.body.data.purpose, "avatar");
      assert.strictEqual(res.body.data.mimeType, "image/png");
      assert.ok(res.body.data.url.startsWith("/uploads/avatar/"));

      uploadedFileId = res.body.data.fileId;
    });

    test("POST /files should reject file types not permitted for the specified purpose", async () => {
      // Avatar only permits image/jpeg, image/png, image/webp. Giving application/pdf should fail.
      const pdfBuffer = Buffer.from("%PDF-1.4 mock pdf data");
      const res = await request(app)
        .post("/api/v1/files")
        .set("Authorization", `Bearer ${registerResponse.accessToken}`)
        .query({ purpose: "avatar" })
        .attach("file", pdfBuffer, "license.pdf")
        .expect(400);

      assert.strictEqual(res.body.success, false);
      assert.ok(res.body.message.includes("Invalid file type"));
    });

    test("POST /files should reject files exceeding the maximum size limit for that purpose", async () => {
      // Avatar is capped at 2MB. We construct a 3MB fake file.
      const bigBuffer = Buffer.alloc(3 * 1024 * 1024); // 3MB of zeros
      const res = await request(app)
        .post("/api/v1/files")
        .set("Authorization", `Bearer ${registerResponse.accessToken}`)
        .query({ purpose: "avatar" })
        .attach("file", bigBuffer, "giant.png")
        .expect(400);

      assert.strictEqual(res.body.success, false);
      assert.ok(res.body.message.includes("File size exceeds maximum limit"));
    });

    test("GET /files/:id should retrieve uploaded file details for the owner", async () => {
      const res = await request(app)
        .get(`/api/v1/files/${uploadedFileId}`)
        .set("Authorization", `Bearer ${registerResponse.accessToken}`)
        .expect(200);

      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.data.fileId, uploadedFileId);
      assert.strictEqual(res.body.data.purpose, "avatar");
    });

    test("DELETE /files/:id should allow admins to delete file records", async () => {
      // Customer should be forbidden from deleting
      await request(app)
        .delete(`/api/v1/files/${uploadedFileId}`)
        .set("Authorization", `Bearer ${registerResponse.accessToken}`)
        .expect(403);

      // Admin should delete successfully
      const res = await request(app)
        .delete(`/api/v1/files/${uploadedFileId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.message, "File asset deleted successfully");

      // Verify it's gone
      await request(app)
        .get(`/api/v1/files/${uploadedFileId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(404);
    });
  });

  describe("7. Refresh Token Rotation and Replay/Reuse Prevention", () => {
    test("POST /auth/refresh should successfully rotate the refresh token once", async () => {
      const res = await request(app)
        .post("/api/v1/auth/refresh")
        .send({ refreshToken: registerResponse.refreshToken })
        .expect(200);

      assert.strictEqual(res.body.success, true);
      assert.ok(res.body.data.accessToken);
      assert.ok(res.body.data.refreshToken);
      assert.notStrictEqual(res.body.data.refreshToken, registerResponse.refreshToken);

      // Save rotated tokens
      registerResponse.rotatedAccessToken = res.body.data.accessToken;
      registerResponse.rotatedRefreshToken = res.body.data.refreshToken;
    });

    test("POST /auth/refresh using a reused/replayed refresh token should revoke all user sessions", async () => {
      // 1. Attempt to refresh again using the original (already used/rotated) refreshToken
      const res = await request(app)
        .post("/api/v1/auth/refresh")
        .send({ refreshToken: registerResponse.refreshToken })
        .expect(401);

      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.message, "Refresh token has already been used");

      // 2. Since all sessions should be revoked and tokenVersion incremented,
      // the rotatedRefreshToken (which was active) should now be rejected as well
      const followUpRes = await request(app)
        .post("/api/v1/auth/refresh")
        .send({ refreshToken: registerResponse.rotatedRefreshToken })
        .expect(401);

      assert.strictEqual(followUpRes.body.success, false);
    });
  });
});
