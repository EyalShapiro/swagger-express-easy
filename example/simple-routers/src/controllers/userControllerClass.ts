import type { Request, Response } from 'express';
import { SwaggerRoute } from 'swagger-express-easy';

// 2. Using @SwaggerRoute in a class controller
export class UserController {
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
