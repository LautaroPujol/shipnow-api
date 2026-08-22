import pedidoService from '../services/pedido.service.js';
import { HTTP_STATUS } from '../utils/constants.js';

class PedidoController {
  async getAll(req, res, next) {
    try {
      const pedidos = await pedidoService.getAllPedidos();
      return res.status(HTTP_STATUS.OK).json({ status: 'success', payload: pedidos });
    } catch (error) {
      return next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const pedido = await pedidoService.getPedidoById(req.params.id);
      return res.status(HTTP_STATUS.OK).json({ status: 'success', payload: pedido });
    } catch (error) {
      return next(error);
    }
  }

  async create(req, res, next) {
    try {
      const newPedido = await pedidoService.createPedido(req.body);
      return res.status(HTTP_STATUS.CREATED).json({ status: 'success', payload: newPedido });
    } catch (error) {
      return next(error);
    }
  }

  async update(req, res, next) {
    try {
      const updated = await pedidoService.updatePedido(req.params.id, req.body);
      return res.status(HTTP_STATUS.OK).json({ status: 'success', payload: updated });
    } catch (error) {
      return next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await pedidoService.deletePedido(req.params.id);
      return res.status(HTTP_STATUS.NO_CONTENT).send();
    } catch (error) {
      return next(error);
    }
  }
}

export default new PedidoController();