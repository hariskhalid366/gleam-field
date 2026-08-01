import mongoose, { Schema, type Document, type Model } from "mongoose";

export const TICKET_CATEGORIES = ["Billing", "Booking", "Technician", "App Issue", "Other"] as const;
export type TicketCategory = (typeof TICKET_CATEGORIES)[number];

export const TICKET_PRIORITIES = ["low", "medium", "high", "urgent"] as const;
export type TicketPriority = (typeof TICKET_PRIORITIES)[number];

export const TICKET_STATUSES = ["open", "pending", "resolved", "closed"] as const;
export type TicketStatus = (typeof TICKET_STATUSES)[number];

export interface ISupportMessage {
  sender?: mongoose.Types.ObjectId;
  text: string;
  createdAt: Date;
}

export interface ISupportTicket extends Document {
  subject: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  requester: mongoose.Types.ObjectId;
  requesterName?: string;
  requesterEmail?: string;
  repeatContact: boolean;
  agent?: string;
  messages: ISupportMessage[];
}

const supportTicketSchema = new Schema<ISupportTicket>(
  {
    subject: { type: String, required: true, trim: true, maxlength: 200 },
    category: { type: String, enum: TICKET_CATEGORIES, required: true, index: true },
    priority: { type: String, enum: TICKET_PRIORITIES, default: "medium", index: true },
    status: { type: String, enum: TICKET_STATUSES, default: "open", index: true },
    requester: { type: Schema.Types.ObjectId, ref: "User", index: true },
    requesterName: { type: String, trim: true, maxlength: 120 },
    requesterEmail: { type: String, trim: true, lowercase: true, maxlength: 254, index: true },
    repeatContact: { type: Boolean, default: false, index: true },
    agent: { type: String, trim: true, maxlength: 100 },
    messages: [
      {
        sender: { type: Schema.Types.ObjectId, ref: "User" },
        text: { type: String, required: true, maxlength: 2000 },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true },
);

export const SupportTicket: Model<ISupportTicket> =
  mongoose.models.SupportTicket ?? mongoose.model<ISupportTicket>("SupportTicket", supportTicketSchema);
