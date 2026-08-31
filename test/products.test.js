import { expect } from 'chai';
import request from 'supertest';
import app from '../src/app.js';

describe('Products API', () => {
  const productoValido = {
    title: 'Producto de Test',
    description: 'Descripción de prueba',
    price: 1000,
    stock: 5,
    code: `TEST-${Date.now()}`,
  };

  let productoId;

  describe('GET /api/products', () => {
    it('debería devolver status 200 y un payload en formato array', async () => {
      const res = await request(app).get('/api/products');

      expect(res.status).to.equal(200);
      expect(res.body.status).to.equal('success');
      expect(res.body.payload).to.be.an('array');
    });
  });

  describe('POST /api/products', () => {
    it('debería crear un producto con datos válidos', async () => {
      const res = await request(app).post('/api/products').send(productoValido);

      expect(res.status).to.equal(201);
      expect(res.body.status).to.equal('success');
      expect(res.body.payload).to.have.property('_id');
      expect(res.body.payload.code).to.equal(productoValido.code);
      expect(res.body.payload.status).to.equal('available');

      productoId = res.body.payload._id;
    });

    it('debería rechazar un código duplicado con 400 y el formato de error esperado', async () => {
      const res = await request(app).post('/api/products').send(productoValido);

      expect(res.status).to.equal(400);
      expect(res.body.status).to.equal('error');
      expect(res.body.type).to.equal('PRODUCT_CODE_DUPLICATED');
      expect(res.body).to.have.property('message');
    });
  });

  describe('GET /api/products/:id', () => {
    it('debería obtener el producto creado', async () => {
      const res = await request(app).get(`/api/products/${productoId}`);

      expect(res.status).to.equal(200);
      expect(res.body.payload._id).to.equal(productoId);
    });

    it('debería devolver 404 para un producto inexistente', async () => {
      const res = await request(app).get('/api/products/000000000000000000000000');

      expect(res.status).to.equal(404);
      expect(res.body.type).to.equal('PRODUCT_NOT_FOUND');
    });
  });

  describe('PUT /api/products/:id', () => {
    it('debería actualizar el stock y recalcular el status a out_of_stock', async () => {
      const res = await request(app)
        .put(`/api/products/${productoId}`)
        .send({ stock: 0 });

      expect(res.status).to.equal(200);
      expect(res.body.payload.stock).to.equal(0);
      expect(res.body.payload.status).to.equal('out_of_stock');
    });
  });

  describe('DELETE /api/products/:id', () => {
    it('debería eliminar el producto y devolver 204', async () => {
      const res = await request(app).delete(`/api/products/${productoId}`);
      expect(res.status).to.equal(204);
    });

    it('debería devolver 404 al intentar eliminarlo de nuevo', async () => {
      const res = await request(app).delete(`/api/products/${productoId}`);
      expect(res.status).to.equal(404);
      expect(res.body.type).to.equal('PRODUCT_NOT_FOUND');
    });
  });
});