const isProduction: boolean = process.env.NODE_ENV === "production";

type cookieOptions = {
  httpOnly: boolean;
  secure: boolean;
  sameSite: string;
  path: string;
};

const cookieOptions: cookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: "Lax", // 👈 ستعمل بدون مشاكل لأن المتصفح يعتبرها Same-Site الآن
  path: "/api/auth", // 👈 تستطيع قصرها على مسار المصادقة فقط بأمان
};

export default cookieOptions;
