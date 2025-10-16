import app from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import { verifyDatabaseConnection } from "./config/db.js";

const start = async () => {
  try {
    await verifyDatabaseConnection();
    const server = app.listen(env.port, () => {
      logger.info(`HR System API listening on port ${env.port}`);
    });
    
    // Keep the process alive
    process.on('SIGTERM', () => {
      logger.info('SIGTERM received, shutting down gracefully');
      server.close(() => {
        logger.info('Server closed');
        process.exit(0);
      });
    });
    
    process.on('SIGINT', () => {
      logger.info('SIGINT received, shutting down gracefully');
      server.close(() => {
        logger.info('Server closed');
        process.exit(0);
      });
    });
    
  } catch (error) {
    logger.error("Failed to start server", error);
    process.exit(1);
  }
};

start();


