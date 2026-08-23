import express from 'express';
import logger from './config/logger.js';
import productRoutes from './routes/product.routes.js';
import userRoutes from './routes/user.routes.js';
import mockRoutes from './routes/mock.routes.js';
import errorHandler from './middlewares/errorHandler.js';
import logRoutes from './routes/log.routes.js';
import pedidoRoutes from './routes/pedido.routes.js';
import entregaRoutes from './routes/entrega.routes.js';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger.js';

const app = express();

app.use(express.json());

app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/mocks', mockRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/pedidos', pedidoRoutes);
app.use('/api/entregas', entregaRoutes);
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use((req, res) => {
  logger.warning(`Ruta inexistente solicitada: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ status: 'error', message: 'Ruta no encontrada' });
});

app.use(errorHandler);

export default app;