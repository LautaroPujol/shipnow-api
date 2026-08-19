import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import userRepository from '../repositories/user.repository.js';
import pedidoRepository from '../repositories/pedido.repository.js';
import entregaRepository from '../repositories/entrega.repository.js';
import { USER_ROLES, PEDIDO_STATUS, PEDIDO_PRIORITY } from '../utils/constants.js';
import createError from '../errors/errorFactory.js';
import ERROR_TYPES from '../errors/enums.js';
import logger from '../config/logger.js';

const SALT_ROUNDS = 10;
const DEFAULT_QTY = 5;
const MAX_QTY = 100;

const NOMBRES = ['Ana', 'Luis', 'Marcos', 'Sofía', 'Julieta', 'Nicolás', 'Camila', 'Franco', 'Valentina', 'Bruno'];
const APELLIDOS = ['Pérez', 'Gómez', 'Fernández', 'Rodríguez', 'Díaz', 'Romero', 'Torres', 'Flores', 'Acosta', 'Benítez'];
const CALLES = ['Av. Corrientes', 'San Martín', 'Belgrano', 'Mitre', 'Rivadavia', 'Sarmiento', '9 de Julio', 'Alem'];

const MOCK_ROLES = [USER_ROLES.CLIENTE, USER_ROLES.REPARTIDOR];

function pickRandom(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function resolveQty(rawQty) {
  if (rawQty === undefined || rawQty === null || rawQty === '') {
    return DEFAULT_QTY;
  }

  const qty = Number(rawQty);

  if (!Number.isInteger(qty) || qty <= 0) {
    logger.warning(`Cantidad inválida enviada al endpoint de mocks: "${rawQty}"`);
    throw createError(ERROR_TYPES.INVALID_MOCK_QTY, {
      details: { qtyRecibido: rawQty },
    });
  }

  if (qty > MAX_QTY) {
    logger.warning(`Cantidad excede el máximo permitido en mocks: ${qty} (máximo ${MAX_QTY})`);
    throw createError(ERROR_TYPES.INVALID_MOCK_QTY, {
      message: `La cantidad máxima permitida por request es ${MAX_QTY}.`,
      details: { qtyRecibido: qty, maximo: MAX_QTY },
    });
  }

  return qty;
}

class MockService {
  generateMockUsers(qty) {
    return Array.from({ length: qty }, () => {
      const firstName = pickRandom(NOMBRES);
      const lastName = pickRandom(APELLIDOS);
      const uniqueSuffix = Date.now() + Math.floor(Math.random() * 100000);

      return {
        firstName,
        lastName,
        email: `${firstName}.${lastName}.${uniqueSuffix}@test.com`.toLowerCase(),
        password: 'Test1234',
        role: pickRandom(MOCK_ROLES),
      };
    });
  }

  generateMockPedidos(qty, { usuarioIds } = {}) {
    return Array.from({ length: qty }, () => ({
      usuario: usuarioIds?.length ? pickRandom(usuarioIds) : new mongoose.Types.ObjectId(),
      direccionEntrega: `${pickRandom(CALLES)} ${randomInt(100, 4999)}`,
      status: pickRandom(Object.values(PEDIDO_STATUS)),
      prioridad: pickRandom(Object.values(PEDIDO_PRIORITY)),
    }));
  }

  generateMockEntregas(qty, { pedidoIds, repartidorIds } = {}) {
    return Array.from({ length: qty }, () => {
      const entregado = Math.random() > 0.5;
      const asignarRepartidor = repartidorIds?.length && Math.random() > 0.3;

      return {
        pedido: pedidoIds?.length ? pickRandom(pedidoIds) : new mongoose.Types.ObjectId(),
        repartidor: asignarRepartidor ? pickRandom(repartidorIds) : undefined,
        fechaEstimada: new Date(Date.now() + randomInt(1, 5) * 24 * 60 * 60 * 1000),
        fechaEntrega: entregado ? new Date() : undefined,
        entregado,
      };
    });
  }

  getSimulatedUsers(rawQty) {
    const qty = resolveQty(rawQty);
    logger.debug(`Generando ${qty} usuarios simulados en memoria`);
    return this.generateMockUsers(qty);
  }

  getSimulatedPedidos(rawQty) {
    const qty = resolveQty(rawQty);
    logger.debug(`Generando ${qty} pedidos simulados en memoria`);
    return this.generateMockPedidos(qty);
  }

  getSimulatedEntregas(rawQty) {
    const qty = resolveQty(rawQty);
    logger.debug(`Generando ${qty} entregas simuladas en memoria`);
    return this.generateMockEntregas(qty);
  }

  async seedUsers(rawQty) {
    const qty = resolveQty(rawQty);
    const mockUsers = this.generateMockUsers(qty);
    const hashed = await Promise.all(
      mockUsers.map(async (user) => ({
        ...user,
        password: await bcrypt.hash(user.password, SALT_ROUNDS),
      }))
    );

    try {
      const inserted = await userRepository.insertMany(hashed);
      logger.info(`${inserted.length} usuarios de prueba insertados en MongoDB`);
      return inserted;
    } catch (dbError) {
      logger.error(`Fallo insertando usuarios simulados: ${dbError.message}`);
      throw createError(ERROR_TYPES.MOCK_SEED_FAILED, {
        details: { coleccion: 'usuarios' },
      });
    }
  }

  async seedPedidos(rawQty) {
    const qty = resolveQty(rawQty);

    let usuarios = await userRepository.getAll();
    if (usuarios.length === 0) {
      usuarios = await this.seedUsers(Math.max(qty, 3));
    }
    const usuarioIds = usuarios.map((u) => u._id);

    const mockPedidos = this.generateMockPedidos(qty, { usuarioIds });

    try {
      const inserted = await pedidoRepository.insertMany(mockPedidos);
      logger.info(`${inserted.length} pedidos de prueba insertados en MongoDB`);
      return inserted;
    } catch (dbError) {
      logger.error(`Fallo insertando pedidos simulados: ${dbError.message}`);
      throw createError(ERROR_TYPES.MOCK_SEED_FAILED, {
        details: { coleccion: 'pedidos' },
      });
    }
  }

  async seedEntregas(rawQty) {
    const qty = resolveQty(rawQty);

    let pedidos = await pedidoRepository.getAll();
    if (pedidos.length === 0) {
      pedidos = await this.seedPedidos(Math.max(qty, 3));
    }
    const pedidoIds = pedidos.map((p) => p._id);

    const repartidores = await userRepository.getAll({ role: USER_ROLES.REPARTIDOR });
    const repartidorIds = repartidores.map((r) => r._id);

    const mockEntregas = this.generateMockEntregas(qty, { pedidoIds, repartidorIds });

    try {
      const inserted = await entregaRepository.insertMany(mockEntregas);
      logger.info(`${inserted.length} entregas de prueba insertadas en MongoDB`);
      return inserted;
    } catch (dbError) {
      logger.error(`Fallo insertando entregas simuladas: ${dbError.message}`);
      throw createError(ERROR_TYPES.MOCK_SEED_FAILED, {
        details: { coleccion: 'entregas' },
      });
    }
  }
}

export default new MockService();