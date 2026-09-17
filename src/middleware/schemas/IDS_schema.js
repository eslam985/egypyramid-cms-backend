// /backend/middleware/schemas/IDS_schema.js
const { z } = require("zod");

// Factory Function لإنشاء Schema ديناميكية مع قيمة افتراضية "id"
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

module.exports = { createIdParamSchema };
