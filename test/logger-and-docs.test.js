import { expect } from 'chai';
import request from 'supertest';
import app from '../src/app.js';

describe('Health check', () => {
  describe('GET /api/health', () => {
    it('debería devolver status 200 con el estado de la API', async () => {
      const res = await request(app).get('/api/health');

      expect(res.status).to.equal(200);
      expect(res.body.status).to.equal('ok');
      expect(res.body).to.have.property('environment');
      expect(res.body).to.have.property('uptime');
      expect(res.body).to.have.property('timestamp');
      expect(res.body).to.not.have.property('mongoUri');
      expect(res.body).to.not.have.property('password');
    });
  });
});
describe('Logger endpoint', () => {
  describe('GET /api/logs/test', () => {
    it('debería disparar los logs de prueba y devolver 200 con mensaje de confirmación', async () => {
      const res = await request(app).get('/api/logs/test');

      expect(res.status).to.equal(200);
      expect(res.body.status).to.equal('success');
      expect(res.body.message).to.include('6 niveles');
    });
  });
});

describe('Swagger docs', () => {
  describe('GET /api/docs', () => {
    it('debería responder 200 y servir la interfaz HTML de Swagger', async () => {
      const res = await request(app).get('/api/docs/');

      expect(res.status).to.equal(200);
      expect(res.headers['content-type']).to.include('text/html');
    });
  });
});

describe('Rutas inexistentes', () => {
  it('debería devolver 404 con formato consistente para una ruta que no existe', async () => {
    const res = await request(app).get('/api/esta-ruta-no-existe');

    expect(res.status).to.equal(404);
    expect(res.body.status).to.equal('error');
    expect(res.body).to.have.property('message');
  });
});