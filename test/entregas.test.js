import { expect } from 'chai';
import request from 'supertest';
import app from '../src/app.js';

describe('Entregas API (Deliveries)', () => {
  let usuarioId;
  let pedidoId;
  let entregaId;

  before(async () => {
    const usuario = {
      firstName: 'Cliente',
      lastName: 'ParaEntrega',
      email: `cliente.entregas.${Date.now()}@test.com`,
      password: 'Test1234',
      role: 'cliente',
    };
    const userRes = await request(app).post('/api/users').send(usuario);
    usuarioId = userRes.body.payload._id;

    const pedidoRes = await request(app).post('/api/pedidos').send({
      usuario: usuarioId,
      direccionEntrega: 'Av. Entregas 456',
    });
    pedidoId = pedidoRes.body.payload._id;
  });

  describe('POST /api/entregas', () => {
    it('debería crear una entrega asociada a un pedido válido', async () => {
      const res = await request(app).post('/api/entregas').send({ pedido: pedidoId });

      expect(res.status).to.equal(201);
      expect(res.body.status).to.equal('success');
      expect(res.body.payload).to.have.property('_id');
      expect(res.body.payload.entregado).to.equal(false);

      entregaId = res.body.payload._id;
    });

    it('debería rechazar la creación si el pedido no existe (404 PEDIDO_NOT_FOUND)', async () => {
      const res = await request(app)
        .post('/api/entregas')
        .send({ pedido: '000000000000000000000000' });

      expect(res.status).to.equal(404);
      expect(res.body.type).to.equal('PEDIDO_NOT_FOUND');
    });

    it('debería rechazar un repartidor inválido (usuario sin rol repartidor)', async () => {
      const res = await request(app)
        .post('/api/entregas')
        .send({ pedido: pedidoId, repartidor: usuarioId });

      expect(res.status).to.equal(400);
      expect(res.body.type).to.equal('INVALID_ROLE');
    });
  });

  describe('GET /api/entregas/:id', () => {
    it('debería obtener la entrega creada, con el pedido populado', async () => {
      const res = await request(app).get(`/api/entregas/${entregaId}`);

      expect(res.status).to.equal(200);
      expect(res.body.payload._id).to.equal(entregaId);
      expect(res.body.payload.pedido).to.have.property('_id', pedidoId);
    });

    it('debería devolver 404 para una entrega inexistente', async () => {
      const res = await request(app).get('/api/entregas/000000000000000000000000');

      expect(res.status).to.equal(404);
      expect(res.body.type).to.equal('ENTREGA_NOT_FOUND');
    });
  });

  describe('PUT /api/entregas/:id', () => {
    it('debería marcar la entrega como entregada', async () => {
      const res = await request(app)
        .put(`/api/entregas/${entregaId}`)
        .send({ entregado: true });

      expect(res.status).to.equal(200);
      expect(res.body.payload.entregado).to.equal(true);
    });
  });

  describe('DELETE /api/entregas/:id', () => {
    it('debería eliminar la entrega y devolver 204', async () => {
      const res = await request(app).delete(`/api/entregas/${entregaId}`);
      expect(res.status).to.equal(204);
    });
  });
});