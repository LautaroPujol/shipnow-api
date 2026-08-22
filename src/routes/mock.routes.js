/**
 * @swagger
 * /api/mocks/users:
 *   get:
 *     summary: Genera usuarios simulados en memoria (no se guardan en la base)
 *     tags: [Mocks]
 *     parameters:
 *       - in: query
 *         name: qty
 *         schema: { type: integer, default: 5, minimum: 1, maximum: 100 }
 *         description: Cantidad de usuarios a generar (default 5, máximo 100)
 *     responses:
 *       200:
 *         description: Usuarios simulados generados
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     payload:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           firstName: { type: string, example: Ana }
 *                           lastName: { type: string, example: Pérez }
 *                           email: { type: string, example: ana.perez.123@test.com }
 *                           password: { type: string, example: Test1234 }
 *                           role: { type: string, enum: [cliente, repartidor] }
 *       400:
 *         description: Cantidad (qty) inválida
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 * /api/mocks/pedidos:
 *   get:
 *     summary: Genera pedidos simulados en memoria (no se guardan en la base)
 *     tags: [Mocks]
 *     parameters:
 *       - in: query
 *         name: qty
 *         schema: { type: integer, default: 5, minimum: 1, maximum: 100 }
 *     responses:
 *       200:
 *         description: Pedidos simulados generados
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     payload:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Pedido'
 *       400:
 *         description: Cantidad (qty) inválida
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 * /api/mocks/entregas:
 *   get:
 *     summary: Genera entregas simuladas en memoria (no se guardan en la base)
 *     tags: [Mocks]
 *     parameters:
 *       - in: query
 *         name: qty
 *         schema: { type: integer, default: 5, minimum: 1, maximum: 100 }
 *     responses:
 *       200:
 *         description: Entregas simuladas generadas
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     payload:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Entrega'
 *       400:
 *         description: Cantidad (qty) inválida
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 * /api/mocks/seed/users:
 *   post:
 *     summary: Inserta usuarios simulados reales en MongoDB
 *     tags: [Mocks]
 *     parameters:
 *       - in: query
 *         name: qty
 *         schema: { type: integer, default: 5, minimum: 1, maximum: 100 }
 *     responses:
 *       201:
 *         description: Usuarios insertados correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 insertados: { type: integer, example: 10 }
 *                 coleccion: { type: string, example: usuarios }
 *       400:
 *         description: Cantidad (qty) inválida
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Falló la inserción en MongoDB
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 * /api/mocks/seed/pedidos:
 *   post:
 *     summary: Inserta pedidos simulados reales en MongoDB (crea usuarios si no hay ninguno)
 *     tags: [Mocks]
 *     parameters:
 *       - in: query
 *         name: qty
 *         schema: { type: integer, default: 5, minimum: 1, maximum: 100 }
 *     responses:
 *       201:
 *         description: Pedidos insertados correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 insertados: { type: integer, example: 10 }
 *                 coleccion: { type: string, example: pedidos }
 *       400:
 *         description: Cantidad (qty) inválida
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Falló la inserción en MongoDB
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 * /api/mocks/seed/entregas:
 *   post:
 *     summary: Inserta entregas simuladas reales en MongoDB (crea pedidos si no hay ninguno)
 *     tags: [Mocks]
 *     parameters:
 *       - in: query
 *         name: qty
 *         schema: { type: integer, default: 5, minimum: 1, maximum: 100 }
 *     responses:
 *       201:
 *         description: Entregas insertadas correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 insertados: { type: integer, example: 10 }
 *                 coleccion: { type: string, example: entregas }
 *       400:
 *         description: Cantidad (qty) inválida
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Falló la inserción en MongoDB
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */


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