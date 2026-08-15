import CustomError from '../errors/CustomError.js';
import ERROR_DICTIONARY from '../errors/errorDictionary.js';
import ERROR_TYPES from '../errors/enums.js';
import { HTTP_STATUS } from '../utils/constants.js';

// eslint-disable-next-line no-unused-vars
function errorHandler(error, req, res, next) {
  // Si ya es uno de nuestros errores de dominio, lo usamos tal cual.
  if (error instanceof CustomError) {
    return res.status(error.statusCode).json({
      status: 'error',
      type: error.type,
      message: error.message,
      details: error.details,
    });
  }

  // Error inesperado (bug, falla de Mongo no controlada, etc.):
  // no exponemos el detalle interno al cliente, pero sí lo logueamos.
  console.error('[errorHandler] Error no controlado:', error);

  const fallback = ERROR_DICTIONARY[ERROR_TYPES.INTERNAL_SERVER_ERROR];
  return res.status(fallback.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    status: 'error',
    type: ERROR_TYPES.INTERNAL_SERVER_ERROR,
    message: fallback.message,
    details: null,
  });
}

export default errorHandler;