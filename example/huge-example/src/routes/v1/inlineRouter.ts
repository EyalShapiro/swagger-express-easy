import { Router, Request, Response } from 'express';
import { createSwaggerRoute } from 'swagger-express-easy';

const inlineRouter = Router();

// Route 1: Inline logic and docs
createSwaggerRoute({
  method: 'get',
  path: '/api/v1/inline/users',
  tags: ['Inline Mapping'],
  description: { text: 'A completely inline route demonstrating auto-parsing' },
  responses: { 200: { description: 'Returns list of users' } },
});
inlineRouter.get('/users', (req: Request, res: Response) => {
  res.json([
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' },
  ]);
});

// Route 2: Post example inline
createSwaggerRoute({
  method: 'post',
  path: '/api/v1/inline/users',
  tags: ['Inline Mapping'],
  description: { text: 'Creates a new user inline' },
  body: {
    type: 'object',
    properties: { name: { type: 'string', example: 'Charlie' } },
  },
  responses: { 201: { description: 'User created' } },
});
inlineRouter.post('/users', (req: Request, res: Response) => {
  res.status(201).json({ message: 'Created', user: req.body });
});

export default inlineRouter;
