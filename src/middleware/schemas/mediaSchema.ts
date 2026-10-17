// backend/middleware/schemas/mediaSchema.ts
import { z } from "zod";

import { createIdParamSchema } from "#src/middleware/schemas/IDS_schema.js";
import { durationIsoRegex, labelRe } from "#src/utils/regex.js";

const baseMediaSchema = z.object({
  title: z.string().trim().min(3, "العنوان يجب ألا يقل عن 3 أحرف").max(150),
  year: z.string().trim().length(4),
  tmdb_id: z.string().trim().min(3).max(30).optional().nullable(),
  poster_url: z
    .string()
    .trim()
    .pipe(z.url("يجب أن يكون رابط صورة صالح"))
    .optional()
    .nullable(),
  story: z.string().trim().min(8).max(500).optional().nullable(),
  rating: z.string().trim().min(1).max(8).optional().nullable(),
  runtime: z.string().trim().min(3).max(30).optional().nullable(),
  is_ready: z.boolean().default(false),
  genres: z.array(z.coerce.number().int().positive()).optional(),
  labels: z
    .string()
    .trim()
    .regex(labelRe, "التصنيفات يجب أن تكون كلمات مفصولة بفواصل")
    .nullable()
    .optional(),

  category: z.enum(["movie", "tv"], {
    message: "النوع يجب أن يكون movie أو tv",
  }),

  media_type: z.enum(["movie", "series"], {
    message: "النوع يجب أن يكون movie أو series",
  }),

  duration_iso: z
    .string()
    .trim()
    .regex(durationIsoRegex, "صيغة duration_iso غير صحيحة (مثال: PT1H30M)")
    .optional()
    .nullable(),
});

const createMediaSchema = z.object({
  body: baseMediaSchema,
});

const updateMediaSchema = z.object({
  params: createIdParamSchema().shape.params,

  body: baseMediaSchema
    .partial()
    .refine((data) => Object.keys(data).length > 0, {
      message: "يجب إرسال حقل واحد على الأقل للتحديث",
    }),
});

const baseMediasQuerySchema = z.object({
  category: z.enum(["movie", "tv"]).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().max(100).default(10),
  search: z.string().trim().optional(),
  sortOrder: z.enum(["ASC", "DESC"]).optional(),
  sortBy: z
    .enum([
      "title",
      "category",
      "year",
      "is_ready",
      "created_at",
      "rating",
      "runtime",
      "media_type",
    ])
    .optional(),
});

const getMediasQuerySchema = z.object({
  query: baseMediasQuerySchema,
});

const getMediaByAnyId = z.object({
  params: createIdParamSchema().shape.params,
});

export {
  baseMediasQuerySchema,
  baseMediaSchema,
  createMediaSchema,
  updateMediaSchema,
  getMediasQuerySchema,
  getMediaByAnyId,
};
export type BaseMediasQueryType = z.infer<typeof baseMediasQuerySchema>;
export type UetMediasQueryType = z.infer<typeof getMediasQuerySchema>;
export type GetMediaByAnyIdType = z.infer<typeof getMediaByAnyId>;
export type CreateMediaType = z.infer<typeof baseMediaSchema>;
export type UpdateMediaType = z.infer<typeof baseMediaSchema>;
