import { Router } from 'express';
import { withSwagger } from 'swagger-express-easy';

import { authMiddleware } from '../middlewares/auth';

import counterRoutes from './counter';
import helloRoute from './hello';
import messageBoardRoute from './messageBoard';
import picFilesRoute from './picFilesRoute';
import funFa from './funFacts';
import apiV1Route from './v1/index';
import mathRoute from './math';
import fileV1Route from './files-v1';

import { MathController } from '../controllers/math.controller';
import { fileUploadsRouter } from './filesUploads';
import ordersRouter from './orders.routes';
import { simulateAsyncError } from '@/utils/heleprAsync';

const router = Router();
const mathController = new MathController();
router.use([ordersRouter]);

router.use(authMiddleware);

// 1. Using Class-based methods (decorated with @SwaggerRoute)
router.get('/math/v2/pi', mathController.getPi);
router.post('/math/v2/square', mathController.getSquare);

// 2. Using withSwagger wrapper for plain functions
router.get(
  '/ping',
  withSwagger(
    { method: 'get', path: '/api/ping', description: { text: 'Check if API is alive' } },
    (_req, res) => res.json({ message: 'pong' }),
  ),
);

router.get('/async-error', async (req, res, next) => {
  try {
    // Simulate an async error
    await simulateAsyncError();
  } catch (error) {
    next(error);
  }
});
router.use('/counter', counterRoutes);
router.use('/hello', helloRoute);
router.use('/files-pic', picFilesRoute);
router.use('/files-uploads', fileUploadsRouter);
router.use('/files-1v', fileV1Route);

router.use('/message-board', messageBoardRoute);
router.use('/fuc', funFa);
router.use('/v1', apiV1Route);
router.use('/math', mathRoute);

export default router;
