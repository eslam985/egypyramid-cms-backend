// /backend/middleware/schemas/IDS_schema.js
const { z } = require("zod");

// للـ id الواحد في الـ params /:id
const createIdParamSchema = (paramName = "id") => {
  return z.object({
    params: z.object({
      [paramName]: z.coerce
        .number({ invalid_type_error: `الـ ${paramName} يجب أن يكون رقماً` })
        .int()
        .positive(`الـ ${paramName} يجب أن يكون رقماً موجباً`),
    }),
  });
};

// للـ bulk delete
const deleteManyIdsSchema = z.object({
  body: z.object({
    ids: z
      .array(
        z.coerce
          .number({ invalid_type_error: `الـ id يجب أن يكون رقماً` })
          .int()
          .positive(`الـ id يجب أن يكون رقماً موجباً`),
      )
      .min(1, "لازم تبعت id واحد على الأقل")
      .max(100, "اقصى عدد 100 مرة واحدة")
      .refine((arr) => new Set(arr).size === arr.length, {
        message: "ممنوع تكرر نفس الـ id",
      }),
  }),
});

module.exports = { createIdParamSchema, deleteManyIdsSchema };
