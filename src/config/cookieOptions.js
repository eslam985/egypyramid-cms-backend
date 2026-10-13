const isProduction = process.env.NODE_ENV === "production";

const cookieOptions = {
  httpOnly: true,
  secure: isProduction, // يجب أن تكون true في البرودكشن لأن Vercel يعمل عبر HTTPS
  sameSite: isProduction ? "none" : "lax", // 👈 في البرودكشن يجب أن تكون "none" لتسمح بالعمل بين نطاقين مختلفين
  path: "/", // 👈 يفضل جعلها "/" بدلاً من "/api/auth" لكي تكون متاحة لكل مسارات الـ API التي تحتاج التحقق من الـ Token
};

module.exports = cookieOptions;