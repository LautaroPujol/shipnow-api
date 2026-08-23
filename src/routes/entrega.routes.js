/**
 * @swagger
 * /api/entregas:
 *   get:
 *     summary: Lista todas las entregas
 *     tags: [Deliveries]
 *     responses:
 *       200:
 *         description: Lista de entregas obtenida correctamente
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
 *   post:
 *     summary: Crea una nueva entrega asociada a un pedido
 *     tags: [Deliveries]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [pedido]
 *             properties:
 *               pedido: { type: string, example: 6a80112c05c662a791d22200, description: 'ID del pedido asociado' }
 *               repartidor: { type: string, example: 6a7f8f1e05c662a791d22127, description: 'ID de un usuario con rol repartidor (opcional)' }
 *               fechaEstimada: { type: string, format: date-time }
 *     responses:
 *       201:
 *         description: Entrega creada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     payload:
 *                       $ref: '#/components/schemas/Entrega'
 *       400:
 *         description: El repartidor indicado no existe o no tiene rol "repartidor"
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: El pedido indicado no existe
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 * /api/entregas/{id}:
 *   get:
 *     summary: Obtiene una entrega por id
 *     tags: [Deliveries]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Entrega encontrada
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     payload:
 *                       $ref: '#/components/schemas/Entrega'
 *       404:
 *         description: Entrega no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   put:
 *     summary: Actualiza una entrega existente
 *     tags: [Deliveries]
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
 *               repartidor: { type: string }
 *               fechaEntrega: { type: string, format: date-time }
 *               entregado: { type: boolean }
 *     responses:
 *       200:
 *         description: Entrega actualizada
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     payload:
 *                       $ref: '#/components/schemas/Entrega'
 *       404:
 *         description: Entrega no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   delete:
 *     summary: Elimina una entrega
 *     tags: [Deliveries]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204:
 *         description: Entrega eliminada correctamente (sin contenido)
 *       404:
 *         description: Entrega no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
  *
 * /api/entregas/{id}/comprobante:
 *   post:
 *     summary: Sube un comprobante y lo asocia a una entrega
 *     tags: [Deliveries]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [archivo]
 *             properties:
 *               archivo:
 *                 type: string
 *                 format: binary
 *                 description: 'Archivo a subir (PDF, JPG, PNG o WEBP, máx. 5MB)'
 *     responses:
 *       201:
 *         description: Comprobante cargado y asociado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     payload:
 *                       $ref: '#/components/schemas/Entrega'
 *       400:
 *         description: Archivo faltante, tipo de archivo inválido, o tamaño excedido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Entrega no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */


import { Router } from 'express';
import entregaController from '../controllers/entrega.controller.js';
import uploadController from '../controllers/upload.controller.js';
import { uploadTo } from '../config/multer.js';

const router = Router();

router.get('/', entregaController.getAll);
router.get('/:id', entregaController.getById);
router.post('/', entregaController.create);
router.put('/:id', entregaController.update);
router.delete('/:id', entregaController.delete);
router.post(
    '/:id/comprobante',
    uploadTo('comprobantes').single('archivo'),
    uploadController.uploadEntregaComprobante
);

export default router;