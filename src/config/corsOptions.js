const allowedOrigins = require("./allowedOrigins.js");

const corsOptions = {
    origin: (origin, callback) => {
        if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
            callback(null, true);
        } else {
            callback(new Error("Not Allowed By CORS"));
        }
    },

    credentials: true,
    maxAge: 86400, // 24 ساعة بالثواني
    optionsSuccessStatus: 200,
    exposedHeaders: ['Retry-After', 'RateLimit-Reset', 'RateLimit-Limit', 'RateLimit-Remaining', 'RateLimit-Policy']

};

module.exports = corsOptions;
