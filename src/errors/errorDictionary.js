import ERROR_TYPES from './enums.js';
import { HTTP_STATUS } from '../utils/constants.js';

const ERROR_DICTIONARY = Object.freeze({
  [ERROR_TYPES.VALIDATION_ERROR]: {
    statusCode: HTTP_STATUS.BAD_REQUEST,
    message: 'Los datos enviados no son válidos.',
  },
  [ERROR_TYPES.NOT_FOUND]: {
    statusCode: HTTP_STATUS.NOT_FOUND,
    message: 'El recurso solicitado no existe.',
  },
  [ERROR_TYPES.DATABASE_ERROR]: {
    statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
    message: 'Ocurrió un error al acceder a la base de datos.',
  },
  [ERROR_TYPES.INTERNAL_SERVER_ERROR]: {
    statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
    message: 'Ocurrió un error interno inesperado.',
  },

  [ERROR_TYPES.PRODUCT_NOT_FOUND]: {
    statusCode: HTTP_STATUS.NOT_FOUND,
    message: 'Producto no encontrado.',
  },
  [ERROR_TYPES.PRODUCT_CODE_DUPLICATED]: {
    statusCode: HTTP_STATUS.BAD_REQUEST,
    message: 'Ya existe un producto con ese código.',
  },

  [ERROR_TYPES.USER_NOT_FOUND]: {
    statusCode: HTTP_STATUS.NOT_FOUND,
    message: 'Usuario no encontrado.',
  },
  [ERROR_TYPES.USER_EMAIL_DUPLICATED]: {
    statusCode: HTTP_STATUS.BAD_REQUEST,
    message: 'Ya existe un usuario con ese email.',
  },
  [ERROR_TYPES.INVALID_ROLE]: {
    statusCode: HTTP_STATUS.BAD_REQUEST,
    message: 'El rol especificado no es válido.',
  },

  [ERROR_TYPES.PEDIDO_NOT_FOUND]: {
    statusCode: HTTP_STATUS.NOT_FOUND,
    message: 'Pedido no encontrado.',
  },
  [ERROR_TYPES.ENTREGA_NOT_FOUND]: {
    statusCode: HTTP_STATUS.NOT_FOUND,
    message: 'Entrega no encontrada.',
  },
  [ERROR_TYPES.INVALID_PEDIDO_STATUS]: {
    statusCode: HTTP_STATUS.BAD_REQUEST,
    message: 'El estado del pedido no es válido.',
  },

  [ERROR_TYPES.INVALID_MOCK_QTY]: {
    statusCode: HTTP_STATUS.BAD_REQUEST,
    message: 'La cantidad solicitada no es válida. Debe ser un número entero positivo.',
  },
  [ERROR_TYPES.MOCK_SEED_FAILED]: {
    statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
    message: 'Ocurrió un error al insertar los datos de prueba en la base de datos.',
  },
});

export default ERROR_DICTIONARY;