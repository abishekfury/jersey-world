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
    const isRemote = uri.startsWith('mongodb+srv://') || (!uri.includes('127.0.0.1') && !uri.includes('localhost'));
    const timeoutMs = isRemote ? 10000 : 2500;
    try {
      logger.info(`Attempting MongoDB connection to: ${uri.replace(/:([^:@]+)@/, ':****@')}...`);
      const conn = await mongoose.connect(uri, {
        autoIndex: true,
        serverSelectionTimeoutMS: timeoutMs,
        connectTimeoutMS: timeoutMs,
      });

      logger.info(`✅ MongoDB Connected Successfully: ${conn.connection.host}/${conn.connection.name}`);
      return conn;
    } catch (err: any) {
      logger.warn(`Could not connect to MongoDB on candidate URI: ${err?.message || err}. Trying next...`);
    }
  }

  logger.error(
    `❌ MongoDB connection failed on all ports (27017, 27018). ` +
    `Please ensure MongoDB is running via 'sudo systemctl start mongod' or 'mongod --dbpath ./data/db'.`
  );
  process.exit(1);
};
