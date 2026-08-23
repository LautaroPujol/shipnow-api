import { expect } from 'chai';
import request from 'supertest';
import path from 'path';
import fs from 'fs';
import app from '../src/app.js';

// Archivo de prueba chico, generado en memoria, sin depender de nada externo.
const TEST_FILE_PATH = path.resolve('test', 'fixtures', 'test-upload.pdf');

function ensureTestFile() {
  const dir = path.dirname(TEST_FILE_PATH);
  fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(TEST_FILE_PATH)) {
    // PDF mínimo pero válido, suficiente para pasar el chequeo de mimetype.
    const minimalPdf =
      '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 200 200]>>endobj\nxref\n0 4\ntrailer<</Size 4/Root 1 0 R>>\n%%EOF';
    fs.writeFileSync(TEST_FILE_PATH, minimalPdf);
  }
}

describe('Uploads API', () => {
  let usuarioId;
  let pedidoId;

  before(async () => {
    ensureTestFile();

    const usuario = {
      firstName: 'Upload',
      lastName: 'Tester',
      email: `upload.tester.${Date.now()}@test.com`,
      password: 'Test1234',
      role: 'cliente',
    };
    const userRes = await request(app).post('/api/users').send(usuario);
    usuarioId = userRes.body.payload._id;

    const pedidoRes = await request(app).post('/api/pedidos').send({
      usuario: usuarioId,
      direccionEntrega: 'Av. Uploads 123',
    });
    pedidoId = pedidoRes.body.payload._id;
  });

  describe('POST /api/users/:id/documentos', () => {
    it('debería subir un documento válido y asociarlo al usuario', async () => {
      const res = await request(app)
        .post(`/api/users/${usuarioId}/documentos`)
        .field('tipoDocumento', 'dni')
        .attach('archivo', TEST_FILE_PATH);

      expect(res.status).to.equal(201);
      expect(res.body.status).to.equal('success');
      expect(res.body.payload.documentos).to.be.an('array').with.lengthOf(1);
      expect(res.body.payload.documentos[0]).to.include({
        originalName: 'test-upload.pdf',
        mimetype: 'application/pdf',
        tipoDocumento: 'dni',
      });
      expect(res.body.payload).to.not.have.property('password');
    });

    it('debería rechazar la carga si falta el archivo (400 FILE_REQUIRED)', async () => {
      const res = await request(app)
        .post(`/api/users/${usuarioId}/documentos`)
        .field('tipoDocumento', 'dni');

      expect(res.status).to.equal(400);
      expect(res.body.status).to.equal('error');
      expect(res.body.type).to.equal('FILE_REQUIRED');
    });

    it('debería rechazar un tipo de documento inválido (400 INVALID_DOCUMENT_TYPE)', async () => {
      const res = await request(app)
        .post(`/api/users/${usuarioId}/documentos`)
        .field('tipoDocumento', 'pasaporte')
        .attach('archivo', TEST_FILE_PATH);

      expect(res.status).to.equal(400);
      expect(res.body.type).to.equal('INVALID_DOCUMENT_TYPE');
      expect(res.body.details).to.have.property('tipoDocumento', 'pasaporte');
    });

    it('debería devolver 404 si el usuario no existe', async () => {
      const res = await request(app)
        .post('/api/users/000000000000000000000000/documentos')
        .field('tipoDocumento', 'dni')
        .attach('archivo', TEST_FILE_PATH);

      expect(res.status).to.equal(404);
      expect(res.body.type).to.equal('USER_NOT_FOUND');
    });
  });

  describe('POST /api/pedidos/:id/comprobante', () => {
    it('debería subir un comprobante válido y asociarlo al pedido', async () => {
      const res = await request(app)
        .post(`/api/pedidos/${pedidoId}/comprobante`)
        .attach('archivo', TEST_FILE_PATH);

      expect(res.status).to.equal(201);
      expect(res.body.payload.comprobantes).to.be.an('array').with.lengthOf(1);
      expect(res.body.payload.comprobantes[0].originalName).to.equal('test-upload.pdf');
    });

    it('debería devolver 404 si el pedido no existe', async () => {
      const res = await request(app)
        .post('/api/pedidos/000000000000000000000000/comprobante')
        .attach('archivo', TEST_FILE_PATH);

      expect(res.status).to.equal(404);
      expect(res.body.type).to.equal('PEDIDO_NOT_FOUND');
    });
  });
});