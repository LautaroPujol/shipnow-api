import mongoose from 'mongoose';
import app from './app.js';
import config from './config/index.js';
import logger from './config/logger.js';

async function startServer() {
  try {
    await mongoose.connect(config.MONGODB_URI);
    logger.info('Conexión a MongoDB establecida');

    app.listen(config.PORT, () => {
      logger.info(`Servidor ShipNow escuchando en el puerto ${config.PORT} (${config.NODE_ENV})`);
    });
  } catch (error) {
    logger.fatal(`No se pudo iniciar la aplicación: ${error.message}`);
    process.exit(1);
  }
}

startServer();