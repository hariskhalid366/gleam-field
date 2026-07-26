import { z } from "zod";

export const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid id");

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.string().max(60).optional(),
  q: z.string().max(120).optional(),
});

export const idParamSchema = z.object({ id: objectId });

export type Pagination = z.infer<typeof paginationSchema>;
