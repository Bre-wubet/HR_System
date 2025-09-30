import winston from "winston";
import { env } from "./env.js";

const { combine, timestamp, json, colorize, printf, errors } = winston.format;

const devFormat = combine(
  colorize(),
  timestamp(),
  errors({ stack: true }),
  printf((info) => `${info.timestamp} ${info.level}: ${info.message}${info.stack ? "\n" + info.stack : ""}`)
);

export const logger = winston.createLogger({
  level: env.logLevel,
  format: env.nodeEnv === "production" ? combine(timestamp(), errors({ stack: true }), json()) : devFormat,
  transports: [new winston.transports.Console()],
  exitOnError: false,
});


