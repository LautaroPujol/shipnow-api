import { Router } from 'express';
import logController from '../controllers/log.controller.js';

const router = Router();

router.get('/test', logController.testLogs);

export default router;