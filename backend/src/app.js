import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import { response } from "./utils/response.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { setupApiGateway, apiGatewayErrorHandler } from "./config/apiGateway.js";

import authRoutes from "./modules/auth/routes/authRoutes.js";
import employeeRoutes from "./modules/hr/routes/employeeRoutes.js";
import recruitmentRoutes from "./modules/hr/routes/recruitmentRoutes.js";
import attendanceRoutes from "./modules/hr/routes/attendanceRoutes.js";

const app = express();

app.disable("x-powered-by");

app.use(helmet());
app.use(cookieParser());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false }));

if (env.nodeEnv !== "production") {
  app.use(morgan("dev"));
}

// Setup API Gateway
setupApiGateway(app);

app.get("/health", (_req, res) => {
  res.status(200).json(response.success({ status: "ok" }));
});

// Authentication routes
app.use("/api/auth", authRoutes);

// HR routes with authentication
app.use("/api/hr/employees", employeeRoutes);
app.use("/api/hr/recruitment", recruitmentRoutes);
app.use("/api/hr/attendance", attendanceRoutes);

app.use((req, res) => {
  res.status(404).json(response.error("Route not found", 404));
});

// API Gateway error handler
app.use(apiGatewayErrorHandler);

// General error handler
app.use(errorHandler);

process.on("unhandledRejection", (reason) => {
  logger.error(`Unhandled Rejection: ${String(reason)}`);
});

process.on("uncaughtException", (err) => {
  logger.error(`Uncaught Exception: ${err.message}`);
});

export default app;


