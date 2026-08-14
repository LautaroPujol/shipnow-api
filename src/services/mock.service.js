import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import userRepository from '../repositories/user.repository.js';
import pedidoRepository from '../repositories/pedido.repository.js';
import entregaRepository from '../repositories/entrega.repository.js';
import { USER_ROLES, PEDIDO_STATUS, PEDIDO_PRIORITY } from '../utils/constants.js';

const SALT_ROUNDS = 10;

const NOMBRES = ['Ana', 'Luis', 'Marcos', 'Sofía', 'Julieta', 'Nicolás', 'Camila', 'Franco', 'Valentina', 'Bruno'];
const APELLIDOS = ['Pérez', 'Gómez', 'Fernández', 'Rodríguez', 'Díaz', 'Romero', 'Torres', 'Flores', 'Acosta', 'Benítez'];
const CALLES = ['Av. Corrientes', 'San Martín', 'Belgrano', 'Mitre', 'Rivadavia', 'Sarmiento', '9 de Julio', 'Alem'];

// ADMIN se crea a mano; para mocks masivos solo tienen sentido estos dos roles.
const MOCK_ROLES = [USER_ROLES.CLIENTE, USER_ROLES.REPARTIDOR];

function pickRandom(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

class MockService {
  /**
   * Genera usuarios simulados EN MEMORIA, sin tocar la base.
   * La password queda en texto plano a propósito: es un dato de mentira
   * para inspeccionar la FORMA del dato, no para loguearse con él.
   */
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

  /** Inserta usuarios simulados reales en Mongo (hasheando la password). */
  async seedUsers(qty) {
    const mockUsers = this.generateMockUsers(qty);
    const hashed = await Promise.all(
      mockUsers.map(async (user) => ({
        ...user,
        password: await bcrypt.hash(user.password, SALT_ROUNDS),
      }))
    );
    return userRepository.insertMany(hashed);
  }

  /** Inserta pedidos reales, asociados a usuarios reales (existentes o recién creados). */
  async seedPedidos(qty) {
    let usuarios = await userRepository.getAll();
    if (usuarios.length === 0) {
      usuarios = await this.seedUsers(Math.max(qty, 3));
    }
    const usuarioIds = usuarios.map((u) => u._id);

    const mockPedidos = this.generateMockPedidos(qty, { usuarioIds });
    return pedidoRepository.insertMany(mockPedidos);
  }

  /** Inserta entregas reales, asociadas a pedidos reales y, si hay, a repartidores reales. */
  async seedEntregas(qty) {
    let pedidos = await pedidoRepository.getAll();
    if (pedidos.length === 0) {
      pedidos = await this.seedPedidos(Math.max(qty, 3));
    }
    const pedidoIds = pedidos.map((p) => p._id);

    const repartidores = await userRepository.getAll({ role: USER_ROLES.REPARTIDOR });
    const repartidorIds = repartidores.map((r) => r._id);

    const mockEntregas = this.generateMockEntregas(qty, { pedidoIds, repartidorIds });
    return entregaRepository.insertMany(mockEntregas);
  }
}

export default new MockService();