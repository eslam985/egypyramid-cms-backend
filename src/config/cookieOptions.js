const isProduction = process.env.NODE_ENV === "production";

const cookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: "Lax",
  path: "/api/auth",
};

module.exports = cookieOptions;