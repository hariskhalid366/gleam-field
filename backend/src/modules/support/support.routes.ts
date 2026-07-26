import { Router } from "express";
import { z } from "zod";
import { SupportTicket, TICKET_CATEGORIES, TICKET_PRIORITIES, TICKET_STATUSES } from "../../models/supportTicket.model.js";
import { authenticate, isAdmin } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { catchAsync } from "../../utils/catchAsync.js";
import { sendPaginated, sendSuccess } from "../../utils/response.js";
import { ApiError } from "../../utils/ApiError.js";
import { idParamSchema, paginationSchema } from "../common/query.validation.js";

export const supportRouter = Router();

const createBody = z.object({
  subject: z.string().min(5).max(200),
  category: z.enum(TICKET_CATEGORIES),
  priority: z.enum(TICKET_PRIORITIES).default("medium"),
  message: z.string().min(2).max(2000),
});

const listQuery = paginationSchema.extend({
  status: z.enum(TICKET_STATUSES).optional(),
  category: z.enum(TICKET_CATEGORIES).optional(),
});

const addMessageBody = z.object({
  text: z.string().min(1).max(2000),
});

const updateTicketBody = z.object({
  status: z.enum(TICKET_STATUSES).optional(),
  agent: z.string().max(100).optional(),
  priority: z.enum(TICKET_PRIORITIES).optional(),
});

/**
 * @openapi
 * /support/tickets:
 *   post:
 *     tags: [Support]
 *     security: [{ bearerAuth: [] }]
 *     summary: Open a new support ticket
 *     responses:
 *       201: { description: Ticket created }
 */
supportRouter.post(
  "/tickets",
  authenticate,
  validate({ body: createBody }),
  catchAsync(async (req, res) => {
    const { subject, category, priority, message } = req.body as z.infer<typeof createBody>;

    const ticket = await SupportTicket.create({
      subject,
      category,
      priority,
      requester: req.user!.id,
      messages: [{ sender: req.user!.id, text: message }],
    });

    return sendSuccess(res, ticket, "Support ticket opened", 201);
  }),
);

/**
 * @openapi
 * /support/tickets:
 *   get:
 *     tags: [Support]
 *     security: [{ bearerAuth: [] }]
 *     summary: List support tickets (all for admins, owned only for customers/techs)
 *     responses:
 *       200: { description: Paginated tickets }
 */
supportRouter.get(
  "/tickets",
  authenticate,
  validate({ query: listQuery }),
  catchAsync(async (req, res) => {
    const { page, limit, status, category } = req.query as unknown as z.infer<typeof listQuery>;
    const filter: Record<string, unknown> = {};

    // Standard users are restricted to tickets they authored
    if (req.user!.role !== "admin" && req.user!.role !== "super_admin") {
      filter.requester = req.user!.id;
    }

    if (status) filter.status = status;
    if (category) filter.category = category;

    const [items, total] = await Promise.all([
      SupportTicket.find(filter)
        .populate("requester", "name email role")
        .sort({ updatedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      SupportTicket.countDocuments(filter),
    ]);

    return sendPaginated(res, items, { page, limit, total }, "Support tickets");
  }),
);

/**
 * @openapi
 * /support/tickets/{id}/messages:
 *   post:
 *     tags: [Support]
 *     security: [{ bearerAuth: [] }]
 *     summary: Send a message reply on an existing support ticket
 *     responses:
 *       200: { description: Message added }
 */
supportRouter.post(
  "/tickets/:id/messages",
  authenticate,
  validate({ params: idParamSchema, body: addMessageBody }),
  catchAsync(async (req, res) => {
    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) throw ApiError.notFound("Support ticket not found");

    // Authorization: Must be admin/agent or the ticket creator
    const isAdminRole = req.user!.role === "admin" || req.user!.role === "super_admin";
    if (!isAdminRole && ticket.requester.toString() !== req.user!.id) {
      throw ApiError.forbidden("Access denied");
    }

    ticket.messages.push({
      sender: req.user!.id as any,
      text: req.body.text,
      createdAt: new Date(),
    });
    ticket.status = isAdminRole ? "pending" : "open"; // if user replies, re-opens; if admin replies, marks pending action
    await ticket.save();

    return sendSuccess(res, ticket, "Message added successfully");
  }),
);

/**
 * @openapi
 * /support/tickets/{id}:
 *   patch:
 *     tags: [Support]
 *     security: [{ bearerAuth: [] }]
 *     summary: Update ticket details/status (admin only)
 *     responses:
 *       200: { description: Ticket updated }
 */
supportRouter.patch(
  "/tickets/:id",
  authenticate,
  isAdmin,
  validate({ params: idParamSchema, body: updateTicketBody }),
  catchAsync(async (req, res) => {
    const updated = await SupportTicket.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) throw ApiError.notFound("Support ticket not found");
    return sendSuccess(res, updated, "Ticket updated");
  }),
);
