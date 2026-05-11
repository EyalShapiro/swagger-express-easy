import { Router } from 'express';

import { authMiddleware } from '../middlewares/auth';

import counterRoutes from './counter';
import helloRoute from './hello';
import messageBoardRoute from './messageBoard';
import filesRoute from './fileUploads';
import funFa from './funFacts';
import apiV1Route from './api/index';
import mathRoute from './math';

import { MathController } from '../controllers/math.controller';
import { withSwagger } from 'swagger-express-easy/swagger/decorators';

const router = Router();
const mathController = new MathController();

router.use(authMiddleware);

// 1. Using Class-based methods (decorated with @SwaggerRoute)
router.get('/math/v2/pi', mathController.getPi);
router.post('/math/v2/square', mathController.getSquare);

// 2. Using withSwagger wrapper for plain functions
router.get('/ping', withSwagger(
  { method: 'get', path: '/api/ping', description: { text: 'Check if API is alive' } },
  (req: any, res: any) => res.json({ message: 'pong' })
));

router.use('/counter', counterRoutes);
router.use('/hello', helloRoute);
router.use('/files', filesRoute);

router.use('/message-board', messageBoardRoute);
router.use('/fuc', funFa);
router.use('/v1', apiV1Route);
router.use('/math', mathRoute);

export default router;
