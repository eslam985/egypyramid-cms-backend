// backend/middleware/schemas/analyticsSchema.ts

import { z } from "zod";

import { paginationSchema } from "#src/middleware/schemas/paginationSchema.js";

const getTotalBrokenAndValidAndPendingLinksSchema = z.object({
  query: z.object({
    status: z.enum(["valid", "broken", "pending"]),
  }),
});

const getMissingEpisodesByServerSchema = z.object({
  query: paginationSchema.shape.query.extend({
    serverName: z.string().trim().min(2).max(50),
  }),
});

const getBrokenLinksSchema = z.object({
  query: paginationSchema.shape.query.extend({
    serverName: z.string().trim().min(2).max(50),
  }),
});

export {
  getTotalBrokenAndValidAndPendingLinksSchema,
  getMissingEpisodesByServerSchema,
  getBrokenLinksSchema,
};

export type GetTotalsByStatusLinksType = z.infer<typeof getTotalBrokenAndValidAndPendingLinksSchema>
export type GetMissingEpisodesByServerType = z.infer<typeof getMissingEpisodesByServerSchema>
export type GetBrokenLinksType = z.infer<typeof getBrokenLinksSchema>
