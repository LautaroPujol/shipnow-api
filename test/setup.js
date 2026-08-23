import mongoose from 'mongoose';
import config from '../src/config/index.js';
import logger from '../src/config/logger.js';

logger.silent = true;

export const mochaHooks = {
  async beforeAll() {
    this.timeout(15000);

    if (!config.MONGODB_URI.includes('shipnow_test')) {
      throw new Error(
        'ABORTADO: la MONGODB_URI de testing no apunta a "shipnow_test". Revisá tu .env.test antes de correr los tests, para no borrar datos reales.'
      );
    }

    await mongoose.connect(config.MONGODB_URI);
  },

  async afterAll() {
    const collections = await mongoose.connection.db.collections();
    for (const collection of collections) {
      await collection.deleteMany({});
    }

    await mongoose.disconnect();
  },
};