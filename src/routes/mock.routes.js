import { Router } from 'express';
import mockController from '../controllers/mock.controller.js';

const router = Router();

// Generación en memoria (no persiste)
router.get('/users', mockController.getMockUsers);
router.get('/pedidos', mockController.getMockPedidos);
router.get('/entregas', mockController.getMockEntregas);

// Carga controlada en la base
router.post('/seed/users', mockController.seedUsers);
router.post('/seed/pedidos', mockController.seedPedidos);
router.post('/seed/entregas', mockController.seedEntregas);

export default router;