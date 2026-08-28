import mongoose from 'mongoose';
import { config } from './env';
import { logger } from './logger';

export const connectDB = async (): Promise<typeof mongoose> => {
  const candidateUris = [
    config.MONGODB_URI,
    'mongodb://127.0.0.1:27017/jersey-world',
    'mongodb://127.0.0.1:27018/jersey-world',
    'mongodb://localhost:27017/jersey-world',
  ];

  // Remove duplicates
  const uniqueUris = Array.from(new Set(candidateUris.filter(Boolean)));

  for (const uri of uniqueUris) {
    try {
      logger.info(`Attempting MongoDB connection to: ${uri}...`);
      const conn = await mongoose.connect(uri, {
        autoIndex: true,
        serverSelectionTimeoutMS: 2000, // Fast 2s failover instead of 30s hang
        connectTimeoutMS: 3000,
      });

      logger.info(`✅ MongoDB Connected Successfully: ${conn.connection.host}:${conn.connection.port}/${conn.connection.name}`);
      return conn;
    } catch {
      logger.warn(`Could not connect to MongoDB on ${uri}. Trying next candidate...`);
    }
  }

  logger.error(
    `❌ MongoDB connection failed on all ports (27017, 27018). ` +
    `Please ensure MongoDB is running via 'sudo systemctl start mongod' or 'mongod --dbpath ./data/db'.`
  );
  process.exit(1);
};
