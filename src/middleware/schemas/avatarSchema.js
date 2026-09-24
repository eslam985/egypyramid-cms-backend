// backend/src/middleware/schemas/avatarSchema.js
const { z } = require("zod");

const uploadAvatarSchema = z.object({
    file: z.object({
        mimetype: z.string().regex(/^image\/(jpeg|png|webp|jpg)$/, "يجب أن يكون الملف صورة (jpeg, png, webp, jpg)"),
        size: z.number().max(5 * 1024 * 1024, "حجم الصورة يجب ألا يتجاوز 5 ميجابايت")
    }, { required_error: "لم يتم إرسال أي صورة" })
});

module.exports = { uploadAvatarSchema };