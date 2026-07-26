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
  let customerUser: any;
  let registerResponse: any;

  before(async () => {
    // Import inside before hook to ensure environment variables are already set
    const { createApp } = await import("../app.js");
    const { connectDatabase } = await import("../config/db.js");

    await connectDatabase();
    app = createApp();
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

  describe("4. Refresh Token Rotation and Replay/Reuse Prevention", () => {
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
