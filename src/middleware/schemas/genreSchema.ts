import { z } from "zod";

import { createIdParamSchema } from "#src/middleware/schemas/IDS_schema.js";

// createGenre
const createGenreSchema = z.object({
  body: z.object({ name: z.string().trim().min(2).max(20) }),
});

const updateGenreByIdSchema = z.object({
  params: createIdParamSchema().shape.params,
  body: createGenreSchema.shape.body
    .partial()
    .refine((data) => Object.keys(data).length > 0, {
      message: "يجب إرسال حقل واحد على الأقل للتحديث",
    }),
});

const findGenreByNameSchema = z.object({
  query: z.object({ name: z.string().trim().min(2).max(20) }),
});

export { createGenreSchema, updateGenreByIdSchema, findGenreByNameSchema };

export type UpdateGenreByIdType = z.infer<typeof updateGenreByIdSchema>;
export type FindGenreByNameType = z.infer<typeof findGenreByNameSchema>;
export type CreateGenreType = z.infer<typeof createGenreSchema>;
