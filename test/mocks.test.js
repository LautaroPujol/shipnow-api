import { expect } from 'chai';
import request from 'supertest';
import app from '../src/app.js';

describe('Mocks API', () => {
  describe('GET /api/mocks/users (generación en memoria)', () => {
    it('debería generar la cantidad de usuarios simulados solicitada', async () => {
      const res = await request(app).get('/api/mocks/users?qty=3');

      expect(res.status).to.equal(200);
      expect(res.body.status).to.equal('success');
      expect(res.body.payload).to.be.an('array').with.lengthOf(3);
      expect(res.body.payload[0]).to.have.all.keys(
        'firstName',
        'lastName',
        'email',
        'password',
        'role'
      );
      expect(res.body.payload[0]).to.not.have.property('_id');
    });

    it('debería rechazar una cantidad negativa (400 INVALID_MOCK_QTY)', async () => {
      const res = await request(app).get('/api/mocks/users?qty=-5');

      expect(res.status).to.equal(400);
      expect(res.body.status).to.equal('error');
      expect(res.body.type).to.equal('INVALID_MOCK_QTY');
      expect(res.body.details).to.have.property('qtyRecibido', '-5');
    });

    it('debería rechazar una cantidad no numérica (400 INVALID_MOCK_QTY)', async () => {
      const res = await request(app).get('/api/mocks/users?qty=abc');

      expect(res.status).to.equal(400);
      expect(res.body.type).to.equal('INVALID_MOCK_QTY');
    });

    it('debería rechazar una cantidad mayor al máximo permitido', async () => {
      const res = await request(app).get('/api/mocks/users?qty=500');

      expect(res.status).to.equal(400);
      expect(res.body.type).to.equal('INVALID_MOCK_QTY');
      expect(res.body.details).to.have.property('maximo', 100);
    });
  });

  describe('POST /api/mocks/seed/users (carga real en MongoDB)', () => {
    it('debería insertar usuarios reales y devolver el conteo', async () => {
      const res = await request(app).post('/api/mocks/seed/users?qty=3');

      expect(res.status).to.equal(201);
      expect(res.body).to.have.property('insertados', 3);
      expect(res.body).to.have.property('coleccion', 'usuarios');
    });

    it('debería rechazar qty inválida también en el endpoint de seed', async () => {
      const res = await request(app).post('/api/mocks/seed/users?qty=0');

      expect(res.status).to.equal(400);
      expect(res.body.type).to.equal('INVALID_MOCK_QTY');
    });
  });
});