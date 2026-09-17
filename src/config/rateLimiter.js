const rateLimit = require("express-rate-limit");

const burstLimiter = rateLimit({
    windowMs: 1 * 1000,
    max: 5, // الحد الأقصى: 5 طلبات في الثانية الواحدة لكل IP
    message: { message: "Too many rapid requests, please slow down" },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => req.method === "OPTIONS",
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { message: "Too many requests" },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => req.method === "OPTIONS",
});

const healthLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 30,
    message: { message: "Too many health check requests" },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => req.method === "OPTIONS",
});

const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { message: "Too many requests" },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => req.method === "OPTIONS",
});

module.exports = { authLimiter, generalLimiter, burstLimiter, healthLimiter };
