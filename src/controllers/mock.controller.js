import mockService from '../services/mock.service.js';
import { HTTP_STATUS } from '../utils/constants.js';

const MAX_QTY = 100;

function parseQty(rawQty, defaultQty = 5) {
  const qty = parseInt(rawQty, 10);
  if (Number.isNaN(qty) || qty <= 0) return defaultQty;
  return Math.min(qty, MAX_QTY);
}

class MockController {
  // GET /api/mocks/users -> datos simulados, NO se guardan
  async getMockUsers(req, res) {
    try {
      const qty = parseQty(req.query.qty);
      const users = mockService.generateMockUsers(qty);
      return res.status(HTTP_STATUS.OK).json({ status: 'success', payload: users });
    } catch (error) {
      return res
        .status(error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ status: 'error', message: error.message });
    }
  }

  // GET /api/mocks/pedidos -> datos simulados, NO se guardan
  async getMockPedidos(req, res) {
    try {
      const qty = parseQty(req.query.qty);
      const pedidos = mockService.generateMockPedidos(qty);
      return res.status(HTTP_STATUS.OK).json({ status: 'success', payload: pedidos });
    } catch (error) {
      return res
        .status(error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ status: 'error', message: error.message });
    }
  }

  // GET /api/mocks/entregas -> datos simulados, NO se guardan
  async getMockEntregas(req, res) {
    try {
      const qty = parseQty(req.query.qty);
      const entregas = mockService.generateMockEntregas(qty);
      return res.status(HTTP_STATUS.OK).json({ status: 'success', payload: entregas });
    } catch (error) {
      return res
        .status(error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ status: 'error', message: error.message });
    }
  }

  // POST /api/mocks/seed/users -> inserta usuarios simulados en Mongo
  async seedUsers(req, res) {
    try {
      const qty = parseQty(req.query.qty);
      const inserted = await mockService.seedUsers(qty);
      return res
        .status(HTTP_STATUS.CREATED)
        .json({ insertados: inserted.length, coleccion: 'usuarios' });
    } catch (error) {
      return res
        .status(error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ status: 'error', message: error.message });
    }
  }

  // POST /api/mocks/seed/pedidos -> inserta pedidos simulados en Mongo
  async seedPedidos(req, res) {
    try {
      const qty = parseQty(req.query.qty);
      const inserted = await mockService.seedPedidos(qty);
      return res
        .status(HTTP_STATUS.CREATED)
        .json({ insertados: inserted.length, coleccion: 'pedidos' });
    } catch (error) {
      return res
        .status(error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ status: 'error', message: error.message });
    }
  }

  // POST /api/mocks/seed/entregas -> inserta entregas simuladas en Mongo
  async seedEntregas(req, res) {
    try {
      const qty = parseQty(req.query.qty);
      const inserted = await mockService.seedEntregas(qty);
      return res
        .status(HTTP_STATUS.CREATED)
        .json({ insertados: inserted.length, coleccion: 'entregas' });
    } catch (error) {
      return res
        .status(error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ status: 'error', message: error.message });
    }
  }
}

export default new MockController();