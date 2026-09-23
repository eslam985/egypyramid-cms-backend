require("dotenv").config();
const express = require("express");
const app = express();
app.set("trust proxy", 1);
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const cors = require("cors");

const pool = require("./config/dbConn");
const gracefulShutdown = require("./config/gracefulShutdown");
const verifyJWT = require("./middleware/verifyJWT.js");
const corsOptions = require("./config/corsOptions.js");
const {
    authLimiter,
    generalLimiter,
    burstLimiter,
    healthLimiter,
} = require("./config/rateLimiter");

const allowedOrigins = require("./config/allowedOrigins.js");
const { logger } = require("./middleware/logEvents");
const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");

const PORT = process.env.PORT || 3000;

// custom middleware logger
app.use(logger);
app.use(helmet());

// 1. CORS first, to ensure the headers are present in all responses (including 429 errors).

// 2. Health check Protected with healthLimiter
app.use("/api/health", healthLimiter, require("./routes/health"));

// 3. Remaining general limiters and loop protection.
app.use(burstLimiter);
app.use(generalLimiter);

// 4. Parsers for permitted requests only
app.use(express.urlencoded({ extended: false, limit: "10kb" }));
app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());
console.log("Allowed origins:", allowedOrigins);
// public Route
app.use("/api/auth/login", authLimiter, require("./routes/api/auth/login.js"));
app.use("/api/auth/refresh", require("./routes/api/auth/refresh.js"));
app.use("/api/auth/logout", require("./routes/api/auth/logout.js"));

// Protected paths
app.use(verifyJWT);
app.use("/api/analytics", require("./routes/api/data/analytics.js"));
app.use("/api/tasks", require("./routes/api/data/downloadTasks.js"));
app.use("/api/genres", require("./routes/api/data/genres.js"));
app.use("/api/medias", require("./routes/api/data/medias.js"));
app.use("/api/seasons", require("./routes/api/data/seasons.js"));
app.use("/api/episodes", require("./routes/api/data/episodes.js"));
app.use("/api/links", require("./routes/api/data/links.js"));

// handle NOT FOUND route
app.use(notFound);

app.use(errorHandler);

const server = app.listen(PORT, "0.0.0.0", () =>
    console.log(`server running in port ${PORT}`),
);
gracefulShutdown(server, pool);

module.exports = app;