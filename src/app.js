import express from 'express';
import mongoose from 'mongoose';
import config from './config/index.js';
import logger from './config/logger.js';
import productRoutes from './routes/product.routes.js';
import userRoutes from './routes/user.routes.js';
import mockRoutes from './routes/mock.routes.js';
import errorHandler from './middlewares/errorHandler.js';
import logRoutes from './routes/log.routes.js';

const app = express();

app.use(express.json());

app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/mocks', mockRoutes);
app.use('/api/logs', logRoutes);

app.use((req, res) => {
  logger.warning(`Ruta inexistente solicitada: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ status: 'error', message: 'Ruta no encontrada' });
});

app.use(errorHandler);

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