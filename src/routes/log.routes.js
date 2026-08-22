/**
 * @swagger
 * /api/logs/test:
 *   get:
 *     summary: Dispara un log de cada nivel (debug, http, info, warning, error, fatal)
 *     description: >
 *       Endpoint interno para validar la configuración del logger (Winston).
 *       No representa una funcionalidad real del negocio de ShipNow: es una
 *       herramienta de diagnóstico para confirmar que los 6 niveles se registran
 *       correctamente en consola y, en el caso de error/fatal, en el archivo
 *       rotado dentro de la carpeta logs/.
 *     tags: [Logger]
 *     responses:
 *       200:
 *         description: Logs de prueba generados correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: success }
 *                 message: { type: string, example: 'Se generaron logs de los 6 niveles: debug, http, info, warning, error, fatal.' }
 */


import { Router } from 'express';
import logController from '../controllers/log.controller.js';

const router = Router();

router.get('/test', logController.testLogs);

export default router;