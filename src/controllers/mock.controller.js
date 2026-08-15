import mockService from '../services/mock.service.js';
import { HTTP_STATUS } from '../utils/constants.js';

class MockController {
  // GET /api/mocks/users -> datos simulados, NO se guardan
  async getMockUsers(req, res, next) {
    try {
      const users = mockService.getSimulatedUsers(req.query.qty);
      return res.status(HTTP_STATUS.OK).json({ status: 'success', payload: users });
    } catch (error) {
      return next(error);
    }
  }

  // GET /api/mocks/pedidos -> datos simulados, NO se guardan
  async getMockPedidos(req, res, next) {
    try {
      const pedidos = mockService.getSimulatedPedidos(req.query.qty);
      return res.status(HTTP_STATUS.OK).json({ status: 'success', payload: pedidos });
    } catch (error) {
      return next(error);
    }
  }

  // GET /api/mocks/entregas -> datos simulados, NO se guardan
  async getMockEntregas(req, res, next) {
    try {
      const entregas = mockService.getSimulatedEntregas(req.query.qty);
      return res.status(HTTP_STATUS.OK).json({ status: 'success', payload: entregas });
    } catch (error) {
      return next(error);
    }
  }

  // POST /api/mocks/seed/users -> inserta usuarios simulados en Mongo
  async seedUsers(req, res, next) {
    try {
      const inserted = await mockService.seedUsers(req.query.qty);
      return res
        .status(HTTP_STATUS.CREATED)
        .json({ insertados: inserted.length, coleccion: 'usuarios' });
    } catch (error) {
      return next(error);
    }
  }

  // POST /api/mocks/seed/pedidos -> inserta pedidos simulados en Mongo
  async seedPedidos(req, res, next) {
    try {
      const inserted = await mockService.seedPedidos(req.query.qty);
      return res
        .status(HTTP_STATUS.CREATED)
        .json({ insertados: inserted.length, coleccion: 'pedidos' });
    } catch (error) {
      return next(error);
    }
  }

  // POST /api/mocks/seed/entregas -> inserta entregas simuladas en Mongo
  async seedEntregas(req, res, next) {
    try {
      const inserted = await mockService.seedEntregas(req.query.qty);
      return res
        .status(HTTP_STATUS.CREATED)
        .json({ insertados: inserted.length, coleccion: 'entregas' });
    } catch (error) {
      return next(error);
    }
  }
}

export default new MockController();