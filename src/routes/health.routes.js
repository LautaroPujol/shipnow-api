/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Estado de salud de la API
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: La API está funcionando correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: ok }
 *                 environment: { type: string, example: development }
 *                 uptime: { type: number, example: 123.456, description: 'Segundos desde que arrancó el proceso' }
 *                 timestamp: { type: string, format: date-time }
 */

import { Router } from 'express';
import healthController from '../controllers/health.controller.js';

const router = Router();

router.get('/', healthController.check);

export default router;