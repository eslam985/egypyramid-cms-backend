// /backend/middleware/schemas/userSchema.js
const { z } = require("zod");
const { createIdParamSchema } = require("./IDS_schema");
const { nameRe } = require("../../utils/regex.js");

const createUserSchema = z.object({
    body: z.object({
        username: z.string().trim().min(3).max(30).regex(nameRe),
        email: z.string().trim().lowercase().email(),
        password: z.string().trim().min(6).max(100)
    }) 
});

const updateUserByIdSchema = z.object({

    params: createIdParamSchema().shape.params,

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
};