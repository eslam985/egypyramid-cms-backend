import "dotenv/config";

import express from "express";
const app = express();
app.set("trust proxy", 1);

import cookieParser from "cookie-parser";
import helmet from "helmet";
import cors from "cors";

import downloadTasksRouter from "#src/routes/api/data/downloadTasks.js";
import analyticsRouter from "#src/routes/api/data/analytics.js";
import gracefulShutdown from "#src/config/gracefulShutdown.js";
import episodesRouter from "#src/routes/api/data/episodes.js";
import registerRouter from "#src/routes/api/auth/register.js";
import refreshRouter from "#src/routes/api/auth/refresh.js";
import seasonsRouter from "#src/routes/api/data/seasons.js";
import errorHandler from "#src/middleware/errorHandler.js";
import logoutRouter from "#src/routes/api/auth/logout.js";
import backupRouter from "#src/routes/api/data/backup.js";
import genresRouter from "#src/routes/api/data/genres.js";
import mediasRouter from "#src/routes/api/data/medias.js";
import avatarRouter from "#src/routes/api/auth/avatar.js";
import linksRouter from "#src/routes/api/data/links.js";
import loginRouter from "#src/routes/api/auth/login.js";
import { logger } from "#src/middleware/logEvents.js";
import userRouter from "#src/routes/api/auth/user.js";
import verifyJWT from "#src/middleware/verifyJWT.js";
import corsOptions from "#src/config/corsOptions.js";
import notFound from "#src/middleware/notFound.js";
import healthRouter from "#src/routes/health.js";
import pool from "#src/config/dbConn.js";
import {
  authLimiter,
  generalLimiter,
  burstLimiter,
  healthLimiter,
} from "#src/config/rateLimiter.js";
import { toNumber } from "./utils/paramAndQueryHelpes.js";

const PORT: number = toNumber(process.env.PORT) || 3000;

// custom middleware logger
app.use(logger);
app.use(helmet());

// 1. CORS first, to ensure the headers are present in all responses (including 429 errors).
app.use(cors(corsOptions));

// 2. Health check Protected with healthLimiter
app.use("/api/health", healthLimiter, healthRouter);

// 3. Remaining general limiters and loop protection.
app.use(burstLimiter);
app.use(generalLimiter);

// 4. Parsers for permitted requests only
app.use(express.urlencoded({ extended: false, limit: "10kb" }));
app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());

// public Route
app.use("/api/auth/login", authLimiter, loginRouter);
app.use("/api/auth/refresh", refreshRouter);
app.use("/api/auth/logout", logoutRouter);

// Protected paths
app.use(verifyJWT);
app.use("/api/auth/register", registerRouter);
app.use("/api/avatar", avatarRouter);
app.use("/api/user/", userRouter);
app.use("/api/analytics", analyticsRouter);
app.use("/api/tasks", downloadTasksRouter);
app.use("/api/genres", genresRouter);
app.use("/api/medias", mediasRouter);
app.use("/api/seasons", seasonsRouter);
app.use("/api/episodes", episodesRouter);
app.use("/api/links", linksRouter);
app.use("/api/backup", backupRouter);

// handle NOT FOUND route
app.use(notFound);

app.use(errorHandler);

const server = app.listen(PORT, "0.0.0.0", () =>
  console.log(`server running in port ${PORT}`),
);
gracefulShutdown(server, pool);

export default app;
