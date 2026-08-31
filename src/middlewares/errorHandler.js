import multer from 'multer';
import CustomError from '../errors/CustomError.js';
import ERROR_DICTIONARY from '../errors/errorDictionary.js';
import ERROR_TYPES from '../errors/enums.js';
import createError from '../errors/errorFactory.js';
import { HTTP_STATUS } from '../utils/constants.js';
import logger from '../config/logger.js';

const BUSINESS_ERROR_STATUS_CODES = [HTTP_STATUS.BAD_REQUEST, HTTP_STATUS.NOT_FOUND, HTTP_STATUS.FORBIDDEN, HTTP_STATUS.UNAUTHORIZED];

function translateMulterError(error) {
  if (error.code === 'LIMIT_FILE_SIZE') {
    return createError(ERROR_TYPES.FILE_TOO_LARGE, {
      details: { multerCode: error.code },
    });
  }
  // Cualquier otro error nativo de Multer (campo inesperado, demasiados archivos, etc.)
  return createError(ERROR_TYPES.VALIDATION_ERROR, {
    message: error.message,
    details: { multerCode: error.code },
  });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(error, req, res, next) {
  if (error instanceof multer.MulterError) {
    error = translateMulterError(error);
  }

  if (error instanceof CustomError) {
    const isBusinessError = BUSINESS_ERROR_STATUS_CODES.includes(error.statusCode);

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