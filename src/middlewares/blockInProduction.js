import config from '../config/index.js';
import createError from '../errors/errorFactory.js';
import ERROR_TYPES from '../errors/enums.js';

/**
 * Bloquea el acceso a rutas internas/de desarrollo cuando NODE_ENV=production.
 * Criterio: mocks, el endpoint de prueba del logger y Swagger no deberían
 * estar expuestos en un entorno de producción real.
 */
function blockInProduction(req, res, next) {
  if (config.NODE_ENV === 'production') {
    return next(createError(ERROR_TYPES.NOT_FOUND, {
      message: 'Esta ruta no está disponible en producción.',
    }));
  }
  next();
}

export default blockInProduction;