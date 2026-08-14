import express from 'express';
import mongoose from 'mongoose';
import config from './config/index.js';
import productRoutes from './routes/product.routes.js';
import userRoutes from './routes/user.routes.js';
import mockRoutes from './routes/mock.routes.js';

const app = express();

app.use(express.json());

app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/mocks', mockRoutes);

app.use((req, res) => {
  res.status(404).json({ status: 'error', message: 'Ruta no encontrada' });
});

async function startServer() {
  try {
    await mongoose.connect(config.MONGODB_URI);
    console.log('[db] Conectado a MongoDB');

    app.listen(config.PORT, () => {
      console.log(`[server] ShipNow API corriendo en http://localhost:${config.PORT} (${config.NODE_ENV})`);
    });
  } catch (error) {
    console.error('[server] No se pudo iniciar la aplicación:', error.message);
    process.exit(1);
  }
}

startServer();