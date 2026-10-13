const isProduction = process.env.NODE_ENV === "production";

const cookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: "Lax", // 👈 ستعمل بدون مشاكل لأن المتصفح يعتبرها Same-Site الآن
  path: "/api/auth", // 👈 تستطيع قصرها على مسار المصادقة فقط بأمان
};

module.exports = cookieOptions;
