import rateLimit from "express-rate-limit";

import type { RateLimitRequestHandler } from "express-rate-limit";

const burstLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 1 * 1000,
  max: 5, // الحد الأقصى: 5 طلبات في الثانية الواحدة لكل IP
  message: { message: "Too many rapid requests, please slow down" },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method === "OPTIONS",
});

const authLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: "Too many requests" },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method === "OPTIONS",
});

const healthLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 30,
  message: { message: "Too many health check requests" },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method === "OPTIONS",
});

const generalLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 دقيقة
  max: 100,
  message: { message: "Too many requests" },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method === "OPTIONS",
});

export { authLimiter, generalLimiter, burstLimiter, healthLimiter };
