// /middleware/schemas/seasonSchema.js

import { z } from "zod";

import { createIdParamSchema } from "#src/middleware/schemas/IDS_schema.js";
const baseSeasonSchema = z.object({
  season_number: z.coerce
    .number()
    .int()
    .positive("season_number يجب أن يكون رقماً موجباً"),
});

const createSeasonSchema = z.object({
  params: createIdParamSchema("media_id").shape.params,

  body: baseSeasonSchema,
});

const updateSeasonSchema = z.object({
  params: createIdParamSchema().shape.params,

  body: createSeasonSchema.shape.body
    .partial()
    .refine((data) => Object.keys(data).length > 0, {
      message: "يجب إرسال حقل واحد على الأقل للتحديث",
    }),
});


const baseSeasonQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().max(100).default(10),
  sortOrder: z.enum(["ASC", "DESC"]).optional(),
  sortBy: z
    .enum([
      "season_number",
      "id",
      "media_id",
      "created_at",
    ])
    .optional(),
});

export { createSeasonSchema, updateSeasonSchema };

export type CreateSeasonType = z.infer<typeof baseSeasonSchema>;
export type UpdateSeasonType = z.infer<typeof baseSeasonSchema>;
export type BaseSeasonQueryType = z.infer<typeof baseSeasonQuerySchema>;
