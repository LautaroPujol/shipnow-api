import CustomError from './CustomError.js';
import ERROR_DICTIONARY from './errorDictionary.js';
import ERROR_TYPES from './enums.js';

function createError(type, { message, details } = {}) {
  const definition = ERROR_DICTIONARY[type];

  if (!definition) {
    // Si alguien pasa un type que no está en el diccionario, no lo dejamos
    // pasar en silencio: caemos a INTERNAL_SERVER_ERROR pero dejamos rastro.
    const fallback = ERROR_DICTIONARY[ERROR_TYPES.INTERNAL_SERVER_ERROR];
    return new CustomError({
      type: ERROR_TYPES.INTERNAL_SERVER_ERROR,
      statusCode: fallback.statusCode,
      message: `Tipo de error desconocido: "${type}". ${fallback.message}`,
      details,
    });
  }

  return new CustomError({
    type,
    statusCode: definition.statusCode,
    message: message || definition.message,
    details,
  });
}

export default createError;