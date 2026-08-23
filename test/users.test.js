import { expect } from 'chai';
import request from 'supertest';
import app from '../src/app.js';

describe('Users API', () => {
  const usuarioValido = {
    firstName: 'Test',
    lastName: 'Usuario',
    email: `test.usuario.${Date.now()}@test.com`,
    password: 'Test1234',
    role: 'cliente',
  };

  describe('GET /api/users', () => {
    it('debería devolver status 200 y un payload en formato array', async () => {
      const res = await request(app).get('/api/users');

      expect(res.status).to.equal(200);
      expect(res.body.status).to.equal('success');
      expect(res.body.payload).to.be.an('array');
    });
  });

  describe('POST /api/users', () => {
    it('debería crear un usuario con datos válidos', async () => {
      const res = await request(app).post('/api/users').send(usuarioValido);

      expect(res.status).to.equal(201);
      expect(res.body.status).to.equal('success');
      expect(res.body.payload).to.have.property('_id');
      expect(res.body.payload.email).to.equal(usuarioValido.email);
      expect(res.body.payload.role).to.equal('cliente');
      expect(res.body.payload).to.not.have.property('password');
    });

    it('debería rechazar un email duplicado con 400 y el formato de error esperado', async () => {
      const res = await request(app).post('/api/users').send(usuarioValido);

      expect(res.status).to.equal(400);
      expect(res.body.status).to.equal('error');
      expect(res.body.type).to.equal('USER_EMAIL_DUPLICATED');
      expect(res.body).to.have.property('message');
      expect(res.body).to.have.property('details');
    });
  });

  describe('GET /api/users/:id', () => {
    it('debería devolver 404 con el formato de error esperado para un id inexistente', async () => {
      const res = await request(app).get('/api/users/000000000000000000000000');

      expect(res.status).to.equal(404);
      expect(res.body.status).to.equal('error');
      expect(res.body.type).to.equal('USER_NOT_FOUND');
      expect(res.body.message).to.be.a('string');
    });
  });
});