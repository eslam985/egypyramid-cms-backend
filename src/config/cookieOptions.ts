import type { CookieOptions } from "express";

const isProduction: boolean = process.env.NODE_ENV === "production";

const cookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: "lax", // 👈 ستعمل بدون مشاكل لأن المتصفح يعتبرها Same-Site الآن
  path: "/api/auth", // 👈 تستطيع قصرها على مسار المصادقة فقط بأمان
};

export default cookieOptions;

