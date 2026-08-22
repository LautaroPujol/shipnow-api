import pedidoRepository from '../repositories/pedido.repository.js';
import userRepository from '../repositories/user.repository.js';
import { PEDIDO_STATUS, PEDIDO_PRIORITY } from '../utils/constants.js';
import createError from '../errors/errorFactory.js';
import ERROR_TYPES from '../errors/enums.js';
import logger from '../config/logger.js';

class PedidoService {
  async getAllPedidos() {
    return pedidoRepository.getAll();
  }

  async getPedidoById(id) {
    const pedido = await pedidoRepository.getById(id);
    if (!pedido) {
      logger.warning(`Pedido no encontrado: ${id}`);
      throw createError(ERROR_TYPES.PEDIDO_NOT_FOUND);
    }
    return pedido;
  }

  async createPedido(pedidoData) {
    const usuario = await userRepository.getById(pedidoData.usuario);
    if (!usuario) {
      throw createError(ERROR_TYPES.USER_NOT_FOUND, {
        message: `El usuario "${pedidoData.usuario}" no existe`,
      });
    }

    if (pedidoData.status && !Object.values(PEDIDO_STATUS).includes(pedidoData.status)) {
      throw createError(ERROR_TYPES.INVALID_PEDIDO_STATUS, {
        details: { status: pedidoData.status, validos: Object.values(PEDIDO_STATUS) },
      });
    }

    if (pedidoData.prioridad && !Object.values(PEDIDO_PRIORITY).includes(pedidoData.prioridad)) {
      throw createError(ERROR_TYPES.VALIDATION_ERROR, {
        message: `La prioridad "${pedidoData.prioridad}" no es válida`,
        details: { prioridad: pedidoData.prioridad, validas: Object.values(PEDIDO_PRIORITY) },
      });
    }

    const created = await pedidoRepository.create(pedidoData);
    logger.info(`Pedido creado correctamente: ${created._id}`);
    return created;
  }

  async updatePedido(id, updateData) {
    await this.getPedidoById(id);

    if (updateData.status && !Object.values(PEDIDO_STATUS).includes(updateData.status)) {
      throw createError(ERROR_TYPES.INVALID_PEDIDO_STATUS, {
        details: { status: updateData.status, validos: Object.values(PEDIDO_STATUS) },
      });
    }

    return pedidoRepository.updateById(id, updateData);
  }

  async deletePedido(id) {
    await this.getPedidoById(id);
    return pedidoRepository.deleteById(id);
  }
}

export default new PedidoService();