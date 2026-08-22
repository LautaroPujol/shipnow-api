import entregaRepository from '../repositories/entrega.repository.js';
import pedidoRepository from '../repositories/pedido.repository.js';
import userRepository from '../repositories/user.repository.js';
import { USER_ROLES } from '../utils/constants.js';
import createError from '../errors/errorFactory.js';
import ERROR_TYPES from '../errors/enums.js';
import logger from '../config/logger.js';

class EntregaService {
  async getAllEntregas() {
    return entregaRepository.getAll();
  }

  async getEntregaById(id) {
    const entrega = await entregaRepository.getById(id);
    if (!entrega) {
      logger.warning(`Entrega no encontrada: ${id}`);
      throw createError(ERROR_TYPES.ENTREGA_NOT_FOUND);
    }
    return entrega;
  }

  async createEntrega(entregaData) {
    const pedido = await pedidoRepository.getById(entregaData.pedido);
    if (!pedido) {
      throw createError(ERROR_TYPES.PEDIDO_NOT_FOUND, {
        message: `El pedido "${entregaData.pedido}" no existe`,
      });
    }

    if (entregaData.repartidor) {
      const repartidor = await userRepository.getById(entregaData.repartidor);
      if (!repartidor || repartidor.role !== USER_ROLES.REPARTIDOR) {
        throw createError(ERROR_TYPES.INVALID_ROLE, {
          message: 'El repartidor asignado no existe o no tiene rol "repartidor"',
          details: { repartidor: entregaData.repartidor },
        });
      }
    }

    const created = await entregaRepository.create(entregaData);
    logger.info(`Entrega creada correctamente: ${created._id}`);
    return created;
  }

  async updateEntrega(id, updateData) {
    await this.getEntregaById(id);
    return entregaRepository.updateById(id, updateData);
  }

  async deleteEntrega(id) {
    await this.getEntregaById(id);
    return entregaRepository.deleteById(id);
  }
}

export default new EntregaService();