import { Router, Request, Response } from 'express';
import { withSwagger, SwaggerRoute } from 'swagger-express-easy';

export const router = Router();

// 1. Using withSwagger for a regular route
router.get(
  '/hello',
  withSwagger(
    {
      method: 'get',
      path: '/hello',
      description: { text: 'Returns a simple greeting' },
      responses: {
        200: { description: 'Successful greeting' }
      }
    },
    (req: any, res: any) => {
      res.json({ message: 'Hello from withSwagger!' });
    }
  ) as any
);

// 2. Using @SwaggerRoute in a class controller
class UserController {
  @SwaggerRoute({
    method: 'get',
    path: '/user',
    description: { text: 'Returns a user object' },
    responses: {
      200: { description: 'User found' }
    }
  })
  getUser(req: any, res: any) {
    res.json({ id: 1, name: 'John Doe' });
  }
}

const userController = new UserController();
router.get('/user', userController.getUser.bind(userController));
