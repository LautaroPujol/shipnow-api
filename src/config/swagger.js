import swaggerJsdoc from 'swagger-jsdoc';
import config from './index.js';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ShipNow API',
      version: '1.0.0',
      description:
        'API de ShipNow: sistema de gestión de pedidos y entregas, con arquitectura por capas (Controller-Service-Repository), manejo centralizado de errores, logging con Winston y datos de prueba (mocks). Documentación generada con Swagger/OpenAPI.',
    },
    servers: [
      {
        url: `http://localhost:${config.PORT}`,
        description: 'Servidor local de desarrollo',
      },
    ],
    tags: [
      { name: 'Users', description: 'Gestión de usuarios (clientes, repartidores, admins)' },
      { name: 'Products', description: 'Gestión de productos del catálogo' },
      { name: 'Orders', description: 'Gestión de pedidos' },
      { name: 'Deliveries', description: 'Gestión de entregas' },
      { name: 'Mocks', description: 'Generación y carga de datos de prueba' },
      { name: 'Logger', description: 'Herramienta interna para validar el sistema de logging' },
    ],
    components: {
      schemas: {
        Producto: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '6a7e3bcefa056dcd4efbfc5b' },
            title: { type: 'string', example: 'Zapatillas Running' },
            description: { type: 'string', example: 'Zapatillas para correr, talle 42' },
            price: { type: 'number', example: 45000 },
            stock: { type: 'integer', example: 10 },
            status: { type: 'string', enum: ['available', 'out_of_stock', 'discontinued'], example: 'available' },
            code: { type: 'string', example: 'ZAP-001' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Usuario: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '6a7f8f1e05c662a791d22126' },
            firstName: { type: 'string', example: 'Ana' },
            lastName: { type: 'string', example: 'Pérez' },
            email: { type: 'string', example: 'ana.perez@test.com' },
            role: { type: 'string', enum: ['admin', 'cliente', 'repartidor'], example: 'cliente' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        ItemPedido: {
          type: 'object',
          properties: {
            product: { type: 'string', example: '6a7e3bcefa056dcd4efbfc5b' },
            cantidad: { type: 'integer', example: 2, minimum: 1 },
          },
        },
        Pedido: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '6a80112c05c662a791d22200' },
            usuario: { $ref: '#/components/schemas/Usuario' },
            productos: {
              type: 'array',
              items: { $ref: '#/components/schemas/ItemPedido' },
            },
            direccionEntrega: { type: 'string', example: 'Av. Corrientes 1234' },
            status: {
              type: 'string',
              enum: ['pendiente', 'en_proceso', 'entregado', 'cancelado'],
              example: 'pendiente',
            },
            prioridad: {
              type: 'string',
              enum: ['baja', 'media', 'alta'],
              example: 'media',
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Entrega: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '6a80115c05c662a791d22210' },
            pedido: { $ref: '#/components/schemas/Pedido' },
            repartidor: { $ref: '#/components/schemas/Usuario' },
            fechaEstimada: { type: 'string', format: 'date-time' },
            fechaEntrega: { type: 'string', format: 'date-time', nullable: true },
            entregado: { type: 'boolean', example: false },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'success' },
            payload: {
              description: 'Puede ser un objeto único o un array, según el endpoint',
            },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'error' },
            type: { type: 'string', example: 'PRODUCT_NOT_FOUND' },
            message: { type: 'string', example: 'Producto no encontrado.' },
            details: {
              nullable: true,
              description: 'Información adicional sobre el error, o null',
            },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;