import app from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import { verifyDatabaseConnection } from "./config/db.js";

const start = async () => {
  try {
    await verifyDatabaseConnection();
    app.listen(env.port, () => {
      logger.info(`HR System API listening on port ${env.port}`);
    });
  } catch (error) {
    logger.error("Failed to start server");
    process.exit(1);
  }
};

start();


