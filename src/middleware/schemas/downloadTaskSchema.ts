import { z } from "zod";

import { createIdParamSchema } from "#src/middleware/schemas/IDS_schema.js";
import {
  searchPaginationSchema,
  paginationSchema,
} from "#src/middleware/schemas/paginationSchema.js";

const baseTaskSchema = z.object({
  task_name: z.string().trim().min(2).max(200),
  source_url: z.string().trim().pipe(z.url("رابط المصدر غير صحيح")),
  status: z.enum(["idle", "processing", "failed"], {
    message: "status must be only [ idle, processing, failed ]",
  }),
  progress_percent: z.number().int().min(0).max(100),
  download_speed: z.string().trim(),
  status_message: z.string().trim(),
  is_cancelled: z.boolean(),
  trailer_url: z.string().trim().pipe(z.url("رابط العرض غير صحيح")).nullish(),
  fallback_urls: z
    .array(z.string().trim().pipe(z.url("رابط غير صحيح")))
    .nullable()
    .optional(),
});

const createTaskSchema = z.object({
  body: baseTaskSchema.extend({
    status: baseTaskSchema.shape.status.default("idle"),
    progress_percent: baseTaskSchema.shape.progress_percent.default(0),
    download_speed: baseTaskSchema.shape.download_speed.default("0 MB/s"),
    status_message: baseTaskSchema.shape.status_message.default("Waiting..."),
    is_cancelled: baseTaskSchema.shape.is_cancelled.default(false),
  }),
});

const UpdateTaskByIdSchema = z.object({
  params: createIdParamSchema().shape.params,
  body: baseTaskSchema
    .partial()
    .refine((data) => Object.keys(data).length > 0, {
      message: "يجب إرسال حقل واحد على الأقل للتحديث",
    }),
});

const getAllTasksSchema = z.object({
  query: searchPaginationSchema.shape.query.extend({
    order: z.enum(["DESC", "ASC"]).default("DESC"),
  }),
});

const findByTaskNameSchema = z.object({
  query: paginationSchema.shape.query.extend({
    taskName: z.string().trim().min(2).max(200),
  }),
});

export {
  createTaskSchema,
  UpdateTaskByIdSchema,
  getAllTasksSchema,
  findByTaskNameSchema,
};

export type FindByTaskNameType = z.infer<typeof findByTaskNameSchema>;
export type UpdateTaskByIdType = z.infer<typeof baseTaskSchema>;
export type GetAllTasksType = z.infer<typeof getAllTasksSchema>;
export type CreateTaskType = z.infer<typeof baseTaskSchema>;
