// /backend/middleware/schemas/userSchema.js
const { z } = require("zod");
const { createIdParamSchema } = require("./IDS_schema");
const { nameRe } = require("../../utils/regex.js");

const createUserSchema = z.object({
    body: z.object({
        username: z.string().trim().min(3).max(30).regex(nameRe),
        email: z.string().trim().lowercase().email(),
        password: z.string().trim().min(6).max(100),
        avatar_url: z.string().url("يجب أن يكون رابط صورة صالح").nullish() // إضافة الحقل هنا اختيارياً
    }) 
});

const changePasswordSchema = z.object({
    body: z.object({
        currentPassword: z.string().trim().min(1, "كلمة المرور الحالية مطلوبة"),
        newPassword: z.string().trim().min(6, "كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل").max(100)
    })
});

const updateUserByIdSchema = z.object({
    body: createUserSchema.shape.body.partial().refine(
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

module.exports = {
    createUserSchema,
    updateUserByIdSchema,
    loginUserSchema,
    changePasswordSchema
};