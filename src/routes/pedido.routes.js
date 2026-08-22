/**
 * @swagger
 * /api/pedidos:
 *   get:
 *     summary: Lista todos los pedidos
 *     tags: [Orders]
 *     responses:
 *       200:
 *         description: Lista de pedidos obtenida correctamente
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
 *   post:
 *     summary: Crea un nuevo pedido
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [usuario, direccionEntrega]
 *             properties:
 *               usuario: { type: string, example: 6a7f8f1e05c662a791d22126, description: 'ID del usuario dueño del pedido' }
 *               direccionEntrega: { type: string, example: 'Av. Corrientes 1234' }
 *               status: { type: string, enum: [pendiente, en_proceso, entregado, cancelado], example: pendiente }
 *               prioridad: { type: string, enum: [baja, media, alta], example: media }
 *               productos:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/ItemPedido'
 *     responses:
 *       201:
 *         description: Pedido creado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     payload:
 *                       $ref: '#/components/schemas/Pedido'
 *       400:
 *         description: Estado del pedido inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: El usuario indicado no existe
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 * /api/pedidos/{id}:
 *   get:
 *     summary: Obtiene un pedido por id
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Pedido encontrado
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     payload:
 *                       $ref: '#/components/schemas/Pedido'
 *       404:
 *         description: Pedido no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   put:
 *     summary: Actualiza un pedido existente
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               direccionEntrega: { type: string }
 *               status: { type: string, enum: [pendiente, en_proceso, entregado, cancelado] }
 *               prioridad: { type: string, enum: [baja, media, alta] }
 *     responses:
 *       200:
 *         description: Pedido actualizado
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     payload:
 *                       $ref: '#/components/schemas/Pedido'
 *       400:
 *         description: Estado del pedido inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Pedido no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   delete:
 *     summary: Elimina un pedido
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204:
 *         description: Pedido eliminado correctamente (sin contenido)
 *       404:
 *         description: Pedido no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

import { Router } from 'express';
import pedidoController from '../controllers/pedido.controller.js';

const router = Router();

router.get('/', pedidoController.getAll);
router.get('/:id', pedidoController.getById);
router.post('/', pedidoController.create);
router.put('/:id', pedidoController.update);
router.delete('/:id', pedidoController.delete);

export default router;