import logger from '../config/logger.js';
import { HTTP_STATUS } from '../utils/constants.js';

class LogController {
  // GET /api/logs/test -> dispara un log de cada nivel, para verificar la configuración
  testLogs(req, res) {
    logger.debug('Log de prueba - nivel debug');
    logger.http(`Log de prueba - nivel http (${req.method} ${req.originalUrl})`);
    logger.info('Log de prueba - nivel info');
    logger.warning('Log de prueba - nivel warning');
    logger.error('Log de prueba - nivel error');
    logger.fatal('Log de prueba - nivel fatal');

    return res.status(HTTP_STATUS.OK).json({
      status: 'success',
      message: 'Se generaron logs de los 6 niveles: debug, http, info, warning, error, fatal.',
    });
  }
}

export default new LogController();