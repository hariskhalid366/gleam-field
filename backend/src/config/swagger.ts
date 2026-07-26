import swaggerJsdoc from "swagger-jsdoc";
import type { Express } from "express";
import swaggerUi from "swagger-ui-express";
import { env } from "./env.js";

const spec = swaggerJsdoc({
  definition: {
    openapi: "3.0.3",
    info: {
      title: "ServicePro API",
      version: "1.0.0",
      description:
        "Field Service Management API for ServicePro — authentication, bookings, technicians, verification, services and reviews.",
    },
    servers: [{ url: `http://localhost:${env.PORT}${env.API_PREFIX}`, description: "Local" }],
    components: {
      securitySchemes: {
        bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
      },
      schemas: {
        Error: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string", example: "Validation failed" },
            errors: { type: "object", nullable: true },
          },
        },
        AuthTokens: {
          type: "object",
          properties: {
            accessToken: { type: "string" },
            refreshToken: { type: "string" },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
    tags: [
      { name: "Auth", description: "Registration, login, refresh, logout" },
      { name: "Users", description: "Account management" },
      { name: "Technicians", description: "Technician profiles and verification" },
      { name: "Bookings", description: "Booking lifecycle" },
      { name: "Services", description: "Service catalog" },
      { name: "Reviews", description: "Customer reviews" },
    ],
  },
  apis: ["src/modules/**/*.routes.ts", "dist/modules/**/*.routes.js"],
});

export function mountSwagger(app: Express): void {
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(spec, { customSiteTitle: "ServicePro API Docs" }));
  app.get("/docs.json", (_req, res) => res.json(spec));
}
