import { expect } from 'chai';
import request from 'supertest';
import app from '../src/app.js';

describe('Pedidos API (Orders)', () => {
  let usuarioId;
  let pedidoId;

  // Se ejecuta una vez, antes de todos los tests de este archivo:
  // creamos un usuario propio para no depender de datos cargados a mano.
  before(async () => {
    const usuario = {
      firstName: 'Cliente',
      lastName: 'DeTest',
      email: `cliente.pedidos.${Date.now()}@test.com`,
      password: 'Test1234',
      role: 'cliente',
    };

    const res = await request(app).post('/api/users').send(usuario);
    usuarioId = res.body.payload._id;
  });

  describe('POST /api/pedidos', () => {
    it('debería crear un pedido con datos válidos', async () => {
      const res = await request(app).post('/api/pedidos').send({
        usuario: usuarioId,
        direccionEntrega: 'Av. Test 123',
      });

      expect(res.status).to.equal(201);
      expect(res.body.status).to.equal('success');
      expect(res.body.payload).to.have.property('_id');
      expect(res.body.payload.status).to.equal('pendiente');
      expect(res.body.payload.direccionEntrega).to.equal('Av. Test 123');

      pedidoId = res.body.payload._id;
    });

    it('debería rechazar un pedido sin usuario con el formato de error esperado', async () => {
      const res = await request(app).post('/api/pedidos').send({
        direccionEntrega: 'Av. Sin Usuario 456',
      });

      expect(res.status).to.be.oneOf([400, 404, 500]);
      expect(res.body.status).to.equal('error');
      expect(res.body).to.have.property('type');
    });

    it('debería rechazar un pedido con status inválido (400 INVALID_PEDIDO_STATUS)', async () => {
      const res = await request(app).post('/api/pedidos').send({
        usuario: usuarioId,
        direccionEntrega: 'Av. Test 789',
        status: 'no_existe',
      });

      expect(res.status).to.equal(400);
      expect(res.body.status).to.equal('error');
      expect(res.body.type).to.equal('INVALID_PEDIDO_STATUS');
      expect(res.body.details).to.have.property('status', 'no_existe');
    });
  });

  describe('GET /api/pedidos/:id', () => {
    it('debería obtener el pedido creado, con el usuario populado', async () => {
      const res = await request(app).get(`/api/pedidos/${pedidoId}`);

      expect(res.status).to.equal(200);
      expect(res.body.payload._id).to.equal(pedidoId);
      expect(res.body.payload.usuario).to.have.property('_id', usuarioId);
      expect(res.body.payload.usuario).to.not.have.property('password');
    });

    it('debería devolver 404 para un pedido inexistente', async () => {
      const res = await request(app).get('/api/pedidos/000000000000000000000000');

      expect(res.status).to.equal(404);
      expect(res.body.type).to.equal('PEDIDO_NOT_FOUND');
    });
  });

  describe('PUT /api/pedidos/:id (actualizar estado)', () => {
    it('debería actualizar el status del pedido a "en_proceso"', async () => {
      const res = await request(app)
        .put(`/api/pedidos/${pedidoId}`)
        .send({ status: 'en_proceso' });

      expect(res.status).to.equal(200);
      expect(res.body.payload.status).to.equal('en_proceso');
    });

    it('debería rechazar la actualización a un status inválido', async () => {
      const res = await request(app)
        .put(`/api/pedidos/${pedidoId}`)
        .send({ status: 'teletransportado' });

      expect(res.status).to.equal(400);
      expect(res.body.type).to.equal('INVALID_PEDIDO_STATUS');
    });
  });
});