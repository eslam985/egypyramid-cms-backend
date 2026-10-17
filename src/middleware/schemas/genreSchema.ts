import { z } from "zod";

import { createIdParamSchema } from "#src/middleware/schemas/IDS_schema.js";

// 1. تعريف الـ Body Schema وحدها
const createGenreBodySchema = z.object({
  name: z.string().trim().min(2).max(20),
});

// 2. ربطها بالـ Request الكلي للـ Validation Middleware
const createGenreSchema = z.object({
  body: createGenreBodySchema,
});

const updateGenreByIdSchema = z.object({
  params: createIdParamSchema().shape.params,
  body: createGenreBodySchema
    .partial()
    .refine((data) => Object.keys(data).length > 0, {
      message: "يجب إرسال حقل واحد على الأقل للتحديث",
    }),
});

const findGenreByNameSchema = z.object({
  query: z.object({ name: z.string().trim().min(2).max(20) }),
});

export {
  createGenreSchema,
  updateGenreByIdSchema,
  findGenreByNameSchema,
  createGenreBodySchema,
};

export type UpdateGenreByIdType = z.infer<typeof updateGenreByIdSchema>;
export type FindGenreByNameType = z.infer<typeof findGenreByNameSchema>;
export type CreateAndUpdateGenreType = z.infer<typeof createGenreBodySchema>;
