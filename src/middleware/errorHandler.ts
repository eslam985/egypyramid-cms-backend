// /src/middleware/errorHandler.ts
import type { ErrorRequestHandler } from "express";
import { logEvents } from "#src/middleware/logEvents.js";
import { CustomError } from "#src/utils/customErr.js";

const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  // 1. تسجيل الخطأ في الملف والـ Console دائماً
  logEvents(`${err.name}: ${err.message}`, "errLog.txt");
  console.error(err.stack);

  // التقط خطأ الحجم الخاص بـ Multer صراحة وحوله لـ 413 (Payload Too Large)
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({
      success: false,
      message: "حجم الملف كبير جداً! الحد الأقصى المسموح به هو 5 ميجابايت.",
    });
  }

  // التقط أي أخطاء أخرى خاصة بـ Multer (مثل الحقول غير المتوقعة)
  if (err.name === "MulterError") {
    return res.status(400).json({
      success: false,
      message: `خطأ في تحميل الملف: ${err.message}`,
    });
  }

  // 2. خطأ الـ JSON غير السليم
  if (
    err instanceof SyntaxError &&
    "status" in err &&
    err.status === 400 &&
    "body" in err
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid JSON format provided in request body",
    });
  }

  // 3. أخطاء التطبيق المخصصة القادمة من الكلاس الخاص بنا
  if (err instanceof CustomError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // 4. خطأ تكرار البيانات من PostgreSQL
  if (err.code === "23505") {
    return res.status(409).json({
      success: false,
      message: "Data already exists",
    });
  }

  // 5. خطأ المفتاح الأجنبي (Foreign Key Violation) من PostgreSQL
  if (err.code === "23503") {
    return res.status(404).json({
      success: false,
      message: "Referenced resource not found",
    });
  }

  // 6. باقي الأخطاء غير المتوقعة (Server Errors)
  const statusCode = err.status || err.statusCode || 500;
  return res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
};

export default errorHandler;