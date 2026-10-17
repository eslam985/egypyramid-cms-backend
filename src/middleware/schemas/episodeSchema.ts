import { z } from "zod";

import { paginationSchema } from "#src/middleware/schemas/paginationSchema.js";
import { createIdParamSchema } from "#src/middleware/schemas/IDS_schema.js";

const baseEpisodeSchema = z.object({
  episode_number: z.coerce
    .number()
    .int()
    .positive("episode_number يجب أن يكون رقماً موجباً"),
  season_id: z.preprocess(
    (val) =>
      val === "" || val === null || val === undefined ? null : Number(val),
    z.number().int().positive("season_id يجب أن يكون رقماً موجباً").nullable(),
  ),
  progress_percent: z.coerce.number().int().min(0).max(100).optional(),
  status_message: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.string().trim().min(3).max(100).optional(),
  ),
  download_speed: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.string().trim().min(1).max(100).optional(),
  ),
  status: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.string().trim().min(1).max(100).optional(),
  ),
  download_url: z.preprocess(
    (val) => (val === "" ? null : val),
    z.string().trim().nullable().optional(),
  ),
});

const createEpisodeSchema = z.object({
  params: createIdParamSchema("media_id").shape.params,

  body: baseEpisodeSchema,
});

// updateEpisodeById(id, data)
const updateEpisodeSchema = z.object({
  params: createIdParamSchema().shape.params,

  body: baseEpisodeSchema.partial().refine(
      (data) => Object.keys(data).length > 0, { message: "يجب إرسال حقل واحد على الأقل للتحديث", }
    ),
});

const findEpisodesByMediaIdSchema = z.object({
  query: paginationSchema.shape.query,
  params: createIdParamSchema("media_id").shape.params,
});

const baseEpisodeQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().max(100).default(10),
  sortOrder: z.enum(["ASC", "DESC"]).optional(),
  sortBy: z
    .enum([
      "episode_number",
      "identifier",
      "created_at",
      "updated_at",
      "media_id",
      "id",
    ])
    .optional(),
});

export {
  createEpisodeSchema,
  updateEpisodeSchema,
  findEpisodesByMediaIdSchema,
  baseEpisodeQuerySchema
};

export type GindEpisodesByMediaIdType = z.infer<typeof findEpisodesByMediaIdSchema>;
export type CreateEpisodeType = z.infer<typeof baseEpisodeSchema>;
export type UpdateEpisodeType = z.infer<typeof baseEpisodeSchema>;
export type BaseEpisodeQueryType = z.infer<typeof baseEpisodeQuerySchema>;
