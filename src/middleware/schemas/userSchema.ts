// /backend/middleware/schemas/userSchema.ts
import { z } from "zod";

import { nameRe } from "#src/utils/regex.js";

// 1️⃣ نقوم بعمل كائن الحقول الأساسية مجردة تماماً (بدون كائن body خارجي)
const userCoreShape = z.object({
  username: z.string().trim().min(3).max(30).regex(nameRe),
  email: z.string().trim().lowercase().email(),
  avatar_url: z
    .string()
    .pipe(z.url("يجب أن يكون رابط صورة صالح"))
    .nullish()
    .or(z.literal("")),
  roles: z
    .enum(["5150", "1984", "2001"], {
      message: "roles must be only [ 5150, 1984, 2001 ]",
    })
    .default("2001")
    .optional(),
});

// 2️⃣ الآن ننشئ الـ createUserSchema ونمدد الحقول الأساسية ونغلفها بـ body واحدة فقط!
const createUserSchema = z.object({
  body: userCoreShape.extend({
    password: z.string().trim().min(6).max(100),
  }),
});

// 3️⃣ ننشئ الـ updateUserByIdSchema بشكل سليم
const updateUserByIdSchema = z.object({
  body: userCoreShape.partial().refine((data) => Object.keys(data).length > 0, {
    message: "يجب إرسال حقل واحد على الأقل للتحديث",
  }),
});

// بقية السكيمات المكتوبة عندك (loginUserSchema و changePasswordSchema إلخ) سليمة تماماً لأنها مغلفة بـ body واحدة
const loginUserSchema = z.object({
  body: z.object({
    email: z.string().trim().lowercase().email(),
    password: z.string().trim().min(1, "كلمة المرور مطلوبة"),
  }),
});

const deleteSessionsBy_uuid = z.object({
  body: z.object({
    sessionId: z.string().trim(),
  }),
});

const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().trim().min(1, "كلمة المرور الحالية مطلوبة"),
    newPassword: z
      .string()
      .trim()
      .min(6, "كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل")
      .max(100),
  }),
});

export {
  createUserSchema,
  updateUserByIdSchema,
  loginUserSchema,
  changePasswordSchema,
  deleteSessionsBy_uuid,
};

export type DeleteSessionsBy_uuidType = z.infer<typeof deleteSessionsBy_uuid>;
export type UpdateUserByIdType = z.infer<typeof updateUserByIdSchema>;
export type ChangePasswordType = z.infer<typeof changePasswordSchema>;
export type CreateUserType = z.infer<typeof createUserSchema>;
export type LoginUserType = z.infer<typeof loginUserSchema>;
