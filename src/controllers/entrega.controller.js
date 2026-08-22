import entregaService from '../services/entrega.service.js';
import { HTTP_STATUS } from '../utils/constants.js';

class EntregaController {
  async getAll(req, res, next) {
    try {
      const entregas = await entregaService.getAllEntregas();
      return res.status(HTTP_STATUS.OK).json({ status: 'success', payload: entregas });
    } catch (error) {
      return next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const entrega = await entregaService.getEntregaById(req.params.id);
      return res.status(HTTP_STATUS.OK).json({ status: 'success', payload: entrega });
    } catch (error) {
      return next(error);
    }
  }

  async create(req, res, next) {
    try {
      const newEntrega = await entregaService.createEntrega(req.body);
      return res.status(HTTP_STATUS.CREATED).json({ status: 'success', payload: newEntrega });
    } catch (error) {
      return next(error);
    }
  }

  async update(req, res, next) {
    try {
      const updated = await entregaService.updateEntrega(req.params.id, req.body);
      return res.status(HTTP_STATUS.OK).json({ status: 'success', payload: updated });
    } catch (error) {
      return next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await entregaService.deleteEntrega(req.params.id);
      return res.status(HTTP_STATUS.NO_CONTENT).send();
    } catch (error) {
      return next(error);
    }
  }
}

export default new EntregaController();