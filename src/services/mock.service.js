import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import userRepository from '../repositories/user.repository.js';
import pedidoRepository from '../repositories/pedido.repository.js';
import entregaRepository from '../repositories/entrega.repository.js';
import { USER_ROLES, PEDIDO_STATUS, PEDIDO_PRIORITY } from '../utils/constants.js';
import createError from '../errors/errorFactory.js';
import ERROR_TYPES from '../errors/enums.js';

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

/**
 * Valida el qty que llega crudo desde la query string (string | undefined).
 * Si no vino, usa el default. Si vino pero es inválido, tira CustomError.
 * Acá es "la capa que corresponde": el Controller ya no decide qué es válido.
 */
function resolveQty(rawQty) {
  if (rawQty === undefined || rawQty === null || rawQty === '') {
    return DEFAULT_QTY;
  }

  const qty = Number(rawQty);

  if (!Number.isInteger(qty) || qty <= 0) {
    throw createError(ERROR_TYPES.INVALID_MOCK_QTY, {
      details: { qtyRecibido: rawQty },
    });
  }

  if (qty > MAX_QTY) {
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

  // ---- Endpoints "GET" (memoria, con validación de qty) ----

  getSimulatedUsers(rawQty) {
    const qty = resolveQty(rawQty);
    return this.generateMockUsers(qty);
  }

  getSimulatedPedidos(rawQty) {
    const qty = resolveQty(rawQty);
    return this.generateMockPedidos(qty);
  }

  getSimulatedEntregas(rawQty) {
    const qty = resolveQty(rawQty);
    return this.generateMockEntregas(qty);
  }

  // ---- Endpoints "POST /seed" (persisten, con validación + manejo de fallas de Mongo) ----

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
      return await userRepository.insertMany(hashed);
    } catch (dbError) {
      console.error('[mock.service] Fallo insertando usuarios simulados:', dbError);
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
      return await pedidoRepository.insertMany(mockPedidos);
    } catch (dbError) {
      console.error('[mock.service] Fallo insertando pedidos simulados:', dbError);
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
      return await entregaRepository.insertMany(mockEntregas);
    } catch (dbError) {
      console.error('[mock.service] Fallo insertando entregas simuladas:', dbError);
      throw createError(ERROR_TYPES.MOCK_SEED_FAILED, {
        details: { coleccion: 'entregas' },
      });
    }
  }
}

export default new MockService();