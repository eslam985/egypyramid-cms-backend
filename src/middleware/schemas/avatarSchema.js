// backend/src/middleware/schemas/avatarSchema.js
const { z } = require("zod");

// 1. مخطط فحص الملف المرفوع (كودك الحالي الممتاز)
const uploadAvatarSchema = z.object({
    file: z.object({
        mimetype: z.string().regex(/^image\/(jpeg|png|webp|jpg)$/, "يجب أن يكون الملف صورة (jpeg, png, webp, jpg)"),
        size: z.number().max(5 * 1024 * 1024, "حجم الصورة يجب ألا يتجاوز 5 ميجابايت")
    }, { required_error: "لم يتم إرسال أي صورة" })
});

// 2. مخطط جديد: فحص الرابط المختار من مصفوفة الصور القديمة
const setAvatarFromHistorySchema = z.object({
    body: z.object({
      // 💡 استبدال startsWith بـ regex ليكون أكثر استقراراً وقوة
      chosenAvatarUrl: z.string({ required_error: "رابط الصورة المختارة مطلوب" })
          .trim()
          .url("يجب أن يكون رابط صورة صالح")
          .regex(/^https:\/\/res\.cloudinary\.com\//, "يجب أن تكون الصورة مرفوعة على خوادم Cloudinary الرسمية")
    })
});

module.exports = { 
    uploadAvatarSchema,
    setAvatarFromHistorySchema // تصدير المخطط الجديد
};
