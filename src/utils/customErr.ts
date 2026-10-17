// src/utils/customErr.ts
export class CustomError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message); // استدعاء constructor الكلاس الأصلي Error
    this.statusCode = statusCode;
    this.isOperational = true;

    // للحفاظ على مسار الخطأ (Stack Trace) دقيقاً
    Object.setPrototypeOf(this, CustomError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}