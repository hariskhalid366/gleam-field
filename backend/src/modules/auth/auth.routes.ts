import { Router } from "express";
import { authenticate } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { authLimiter } from "../../middleware/rateLimit.js";
import * as controller from "./auth.controller.js";
import { changePasswordSchema, loginSchema, refreshSchema, registerSchema } from "./auth.validation.js";

export const authRouter = Router();

/**
 * @openapi
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Create a customer or technician account
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name: { type: string }
 *               email: { type: string, format: email }
 *               phone: { type: string }
 *               city: { type: string }
 *               password: { type: string, minLength: 10 }
 *               role: { type: string, enum: [customer, technician] }
 *     responses:
 *       201: { description: Account created }
 *       409: { description: Email already registered }
 */
authRouter.post("/register", authLimiter, validate({ body: registerSchema }), controller.register);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Exchange credentials for an access + refresh token pair
 *     responses:
 *       200: { description: Signed in }
 *       401: { description: Invalid credentials }
 */
authRouter.post("/login", authLimiter, validate({ body: loginSchema }), controller.login);

/**
 * @openapi
 * /auth/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: Rotate the refresh token and mint a new access token
 *     responses:
 *       200: { description: Session refreshed }
 *       401: { description: Invalid, expired or reused refresh token }
 */
authRouter.post("/refresh", authLimiter, validate({ body: refreshSchema }), controller.refresh);

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Revoke the current session
 *     responses:
 *       200: { description: Signed out }
 */
authRouter.post("/logout", controller.logout);

/**
 * @openapi
 * /auth/logout-all:
 *   post:
 *     tags: [Auth]
 *     security: [{ bearerAuth: [] }]
 *     summary: Revoke every session for the current user
 *     responses:
 *       200: { description: All sessions revoked }
 */
authRouter.post("/logout-all", authenticate, controller.logoutAll);

/**
 * @openapi
 * /auth/change-password:
 *   patch:
 *     tags: [Auth]
 *     security: [{ bearerAuth: [] }]
 *     summary: Change password and revoke all sessions
 *     responses:
 *       200: { description: Password updated }
 */
authRouter.patch("/change-password", authenticate, validate({ body: changePasswordSchema }), controller.changePassword);

/**
 * @openapi
 * /auth/me:
 *   get:
 *     tags: [Auth]
 *     security: [{ bearerAuth: [] }]
 *     summary: Current authenticated user (plus technician profile when applicable)
 *     responses:
 *       200: { description: Current user }
 *       401: { description: Unauthorized }
 */
authRouter.get("/me", authenticate, controller.me);
