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
// بدلاً من إعادة تعيين الكائن (الذي يسبب الخطأ)، نقوم بتفريغ الكائن الحالي وتعبئته بالبيانات المنظفة
  if (result.data.body) {
    req.body = result.data.body; // req.body مسموح إعادة تعيينه
  }

  if (result.data.query) {
    // تفريغ الكائن الحالي دون تغيير مرجعيته
    for (const key in req.query) {
      delete req.query[key];
    }
    // دمج البيانات الجديدة النظيفة بداخله
    Object.assign(req.query, result.data.query);
  }

  if (result.data.params) {
    for (const key in req.params) {
      delete req.params[key];
    }
    Object.assign(req.params, result.data.params);
  }


  next();
};

const validateFile = (schema) => (req, res, next) => {
  try {
    schema.parse({ file: req.file });
    next();
  } catch (err) {
    return res.status(400).json({ success: false, errors: err.errors });
  }
};

export { validateRequest, validateFile };
