// backend/middleware/validation.js

/**
 * Middleware عام للتحقق من صحة الطلبات باستخدام Zod
 * @param {import('zod').ZodSchema} schema - Zod Schema الخاص بالمسار
 */
const validateRequest = (schema) => (req, res, next) => {
    const result = schema.safeParse({
        body: req.body,
        query: req.query,
        params: req.params,
    });

    if (!result.success) {
        return res.status(400).json({
        success: false,
        message: "خطأ في البيانات المدخلة",
        errors: result.error.flatten().fieldErrors,
        });
    }

    // استبدال البيانات المدخلة بالبيانات المفحوصة والمنظفة تلقائياً من Zod
    req.body = result.data.body;
    req.query = result.data.query;
    req.params = result.data.params;

    next();
};

module.exports = { validateRequest };