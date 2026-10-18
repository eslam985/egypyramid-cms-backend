// backend/middleware/validation.ts
import type { RequestHandler } from "express";
import { z, type ZodType } from "zod";

/**
 * Middleware عام للتحقق من صحة الطلبات باستخدام Zod
 * @param schema - Zod Schema الخاص بالمسار
 */
const validateRequest = (schema: ZodType): RequestHandler => (req, res, next) => {
  const result = schema.safeParse({
    body: req.body,
    query: req.query,
    params: req.params,
  });

  if (!result.success) {
    res.status(400).json({
      success: false,
      message: "خطأ في البيانات المدخلة",
      errors: z.flattenError(result.error).fieldErrors,
    });
    return;
  }

  // استبدال البيانات المدخلة بالبيانات المفحوصة والمنظفة تلقائياً من Zod
  const data = result.data as { body?: unknown; query?: Record<string, unknown>; params?: Record<string, unknown> };

  if (data.body) {
    req.body = data.body;
  }

  if (data.query) {
    for (const key in req.query) {
      delete req.query[key];
    }
    Object.assign(req.query, data.query);
  }

  if (data.params) {
    for (const key in req.params) {
      delete req.params[key];
    }
    Object.assign(req.params, data.params);
  }

  next();
};

const validateFile = (schema: ZodType): RequestHandler => (req, res, next) => {
  const result = schema.safeParse({ file: req.file });

  if (!result.success) {
    res.status(400).json({
      success: false,
      message: "خطأ في الملف المرفوع",
      errors: z.flattenError(result.error).fieldErrors,
    });
    return;
  }

  next();
};

export { validateRequest, validateFile };
