import app from './app';
import { connectDB } from './config/db';
import { config } from './config/env';
import { logger } from './config/logger';

const startServer = async () => {
  try {
    await connectDB();

    app.listen(config.PORT, () => {
      logger.info(`⚽ Jersey World Server running on http://localhost:${config.PORT}`);
      logger.info(`🚀 API Gateway active at http://localhost:${config.PORT}/api/v1`);
      logger.info(`✨ AI Engine Provider configured: ${config.AI_PROVIDER}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
