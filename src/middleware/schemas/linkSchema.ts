import { z } from "zod";

import { createIdParamSchema } from "#src/middleware/schemas/IDS_schema.js";

const baseLinkSchema =  z.object({
    server_name: z.string().trim().min(2).max(50),
    url: z.string().trim().pipe(z.url("يجب أن يكون رابط صورة صالح")),
    is_fixed: z.boolean().optional(),
    check_count: z.number().int().nonnegative().optional(),
    last_check_status: z.enum(["pending", "valid", "broken"]).optional(),
    link_type: z.enum(["watch", "download"]).optional(),
    quality: z.enum(["1080p", "720p", "480p", "360p", "4k"]).optional(),
  })

const createLinkSchema = z.object({
  params: createIdParamSchema("episode_id").shape.params,
  body: baseLinkSchema,
});

const updateLinkByIdSchema = z.object({
  params: createIdParamSchema("id").shape.params,
  body: createLinkSchema.shape.body
    .partial()
    .refine((data) => Object.keys(data).length > 0, {
      message: "يجب إرسال حقل واحد على الأقل للتحديث",
    }),
});

const baseLinkQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().max(100).default(10),
  sortOrder: z.enum(["ASC", "DESC"]).optional(),
  sortBy: z
    .enum([
      "id",
      "episode_id",
      "server_name",
      "created_at",
      "last_check_status",
      "last_check_at",
      "check_count",
      "is_fixed",
      "last_success_at",
    ])
    .optional(),
});

export { createLinkSchema, updateLinkByIdSchema };

export type UpdateLinkByIdType = z.infer<typeof baseLinkSchema>;
export type CreateLinkType = z.infer<typeof createLinkSchema>;
export type BaseLinkQueryType = z.infer<typeof baseLinkQuerySchema>;
