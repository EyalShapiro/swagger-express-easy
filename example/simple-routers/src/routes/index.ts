import { Router, Request, Response } from 'express';
import { withSwagger, SwaggerRoute } from 'swagger-express-easy';

export const router = Router();
router.get('/ping', (_req: Request, res: Response) => {
  res.send('pong');
});
router.post('/ping', (req: Request, res: Response) => {
  res
    .status(201)
    .json({ data: req.body ?? {}, headers: req.headers, query: req.query, message: 'posng' });
});
router.put('/ping/:id', (req: Request, res: Response) => {
  res
    .status(201)
    .json({ data: req.body ?? {}, headers: req.headers, query: req.query, message: 'posng' });
});
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

// 2. Using @SwaggerRoute in a class controller
class UserController {
  @SwaggerRoute({
    method: 'get',
    path: '/user',
    tags: ['users'],
    description: { text: 'Returns a user object by query parameter' },
    query: {
      id: { type: 'string', required: false, description: 'The User ID to look up' },
    },
    responses: {
      200: { description: 'User found' },
    },
  })
  getUser(req: Request, res: Response) {
    res.json({ id: req.query.id ?? 1, name: 'John Doe' });
  }

  @SwaggerRoute({
    method: 'get',
    tags: ['users'],
    path: '/user/:id',
    description: { text: 'Returns a user object by path parameter' },
    params: {
      id: 'The user ID from path',
    },
    responses: {
      200: { description: 'User found' },
    },
  })
  getUserById(req: Request, res: Response) {
    res.json({
      id: req.params.id,
      name: 'John Doe',
    });
  }
}

const userController = new UserController();

router.get('/user', userController.getUser.bind(userController));
router.get('/user/:id', userController.getUserById.bind(userController));
