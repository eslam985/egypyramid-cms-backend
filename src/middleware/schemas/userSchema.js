// /backend/middleware/schemas/userSchema.js
const { z } = require("zod");
const { createIdParamSchema } = require("./IDS_schema");
const { nameRe } = require("../../utils/regex.js");
// username, email, password, roles
const baseUserSchema = z.object({
    body: z.object({
        username: z.string().trim().min(3).max(30).regex(nameRe),
        email: z.string().trim().lowercase().email(),
        avatar_url: z.string().url("يجب أن يكون رابط صورة صالح").nullish().or(z.literal('')),
        roles: z.enum(["5150", "1984", "2001"], {
          errorMap: () => ({ message: "roles must be only [ 5150, 1984, 2001 ]" })
        }).default("2001").optional()
    }) 
});

const createUserSchema = z.object({
  body: baseUserSchema.extend({
        password: z.string().trim().min(6).max(100),
  })
});

const updateUserByIdSchema = z.object({
    body: baseUserSchema.shape.body.partial().refine(
        (data) => Object.keys(data).length > 0, 
        { message: "يجب إرسال حقل واحد على الأقل للتحديث" }
    )
});


const loginUserSchema = z.object({
    body: z.object({
        email: z.string().trim().lowercase().email(),
        password: z.string().trim().min(1, "كلمة المرور مطلوبة")
    })
});

const deleteSessionsBy_uuid = z.object({
    body: z.object({
        sessionId: z.string().trim()
    })
});

const changePasswordSchema = z.object({
    body: z.object({
        currentPassword: z.string().trim().min(1, "كلمة المرور الحالية مطلوبة"),
        newPassword: z.string().trim().min(6, "كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل").max(100)
    })
});

module.exports = {
    createUserSchema,
    updateUserByIdSchema,
    loginUserSchema,
    changePasswordSchema,
    deleteSessionsBy_uuid
};