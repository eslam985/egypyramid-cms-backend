// /middleware/schemas/seasonSchema.js

import { z } from "zod";

import { createIdParamSchema } from "#src/middleware/schemas/IDS_schema.js";

const createSeasonSchema = z.object({
  params: createIdParamSchema("media_id").shape.params,

  body: z.object({
    season_number: z.coerce
      .number()
      .int()
      .positive("season_number يجب أن يكون رقماً موجباً"),
  }),
});

const updateSeasonSchema = z.object({
  params: createIdParamSchema().shape.params,

  body: createSeasonSchema.shape.body
    .partial()
    .refine((data) => Object.keys(data).length > 0, {
      message: "يجب إرسال حقل واحد على الأقل للتحديث",
    }),
});

export { createSeasonSchema, updateSeasonSchema };


export type CreateSeasonType = z.infer<typeof createSeasonSchema>;
export type UpdateSeasonType = z.infer<typeof updateSeasonSchema>;