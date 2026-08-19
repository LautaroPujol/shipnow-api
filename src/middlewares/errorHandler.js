import CustomError from '../errors/CustomError.js';
import ERROR_DICTIONARY from '../errors/errorDictionary.js';
import ERROR_TYPES from '../errors/enums.js';
import { HTTP_STATUS } from '../utils/constants.js';
import logger from '../config/logger.js';

// Tipos de error que consideramos "esperados"/de negocio: el cliente hizo
// algo mal (dato inválido, recurso inexistente), no es un bug del server.
const BUSINESS_ERROR_STATUS_CODES = [HTTP_STATUS.BAD_REQUEST, HTTP_STATUS.NOT_FOUND, HTTP_STATUS.FORBIDDEN, HTTP_STATUS.UNAUTHORIZED];

// eslint-disable-next-line no-unused-vars
function errorHandler(error, req, res, next) {
  if (error instanceof CustomError) {
    const isBusinessError = BUSINESS_ERROR_STATUS_CODES.includes(error.statusCode);

    // Error esperado/de negocio -> warning. Error de dominio pero con
    // statusCode 500 (ej. falla al insertar mocks) -> error.
    if (isBusinessError) {
      logger.warning(`[${error.type}] ${error.message} - ${req.method} ${req.originalUrl}`);
    } else {
      logger.error(`[${error.type}] ${error.message} - ${req.method} ${req.originalUrl}`);
    }

    return res.status(error.statusCode).json({
      status: 'error',
      type: error.type,
      message: error.message,
      details: error.details,
    });
  }

  // Error totalmente inesperado (bug, excepción no controlada): esto sí es
  // grave porque no lo anticipamos en ningún Service.
  logger.error(`Error inesperado del servidor: ${error.message} - ${req.method} ${req.originalUrl}`);
  logger.debug(error.stack);

  const fallback = ERROR_DICTIONARY[ERROR_TYPES.INTERNAL_SERVER_ERROR];
  return res.status(fallback.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    status: 'error',
    type: ERROR_TYPES.INTERNAL_SERVER_ERROR,
    message: fallback.message,
    details: null,
  });
}

export default errorHandler;