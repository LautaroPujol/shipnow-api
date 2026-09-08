import { HTTP_STATUS } from '../utils/constants.js';
import config from '../config/index.js';

class HealthController {
  check(req, res) {
    return res.status(HTTP_STATUS.OK).json({
      status: 'ok',
      environment: config.NODE_ENV,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  }
}

export default new HealthController();