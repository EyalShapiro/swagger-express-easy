import { Router, Request, Response } from 'express';
import { withSwagger, createSwaggerRoute } from 'swagger-express-easy';
import pingRouter from './ping';
import { UserController } from '../controllers/userControllerClass';

export const router = Router();
createSwaggerRoute({
  path: '/ping',
  method: 'get',
  description: { text: 'Returns a simple greeting' },
  responses: { 200: { description: 'Successful greeting' } },
});
router.use('/ping', pingRouter);
router.get(
  '/hello',
  withSwagger(
    {
      method: 'get',
      path: '/hello',
      description: { text: 'Returns a simple greeting' },
      responses: { 200: { description: 'Successful greeting' } },
    },
    (_req: Request, res: Response) => {
      res.json({ message: 'Hello from withSwagger!' });
    },
  ),
);

const userController = new UserController();

router.get('/user', userController.getUser.bind(userController));
router.get('/user/:id', userController.getUserById.bind(userController));
