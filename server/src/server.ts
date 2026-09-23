import app from './app';
import { connectDB } from './config/db';
import { config } from './config/env';
import { logger } from './config/logger';

import { Product } from './models/Product';
import { populateInitialData } from './seed';

const startServer = async () => {
  try {
    await connectDB();

    // Auto-seed initial catalog if database is empty
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      logger.info('📦 Database empty. Auto-seeding initial catalog and admin...');
      try {
        await populateInitialData();
        logger.info('✅ Initial catalog seeded successfully.');
      } catch (seedErr) {
        logger.error('⚠️ Auto-seeding warning:', seedErr);
      }
    }

    app.listen(config.PORT, () => {
      logger.info(`⚽ GOALZA Server running on http://localhost:${config.PORT}`);
      logger.info(`🚀 API Gateway active at http://localhost:${config.PORT}/api/v1`);
      logger.info(`✨ AI Engine Provider configured: ${config.AI_PROVIDER}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
