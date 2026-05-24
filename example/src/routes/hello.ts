import express from 'express';
import { getHello, getHelloById, postHello, postUser } from '../controllers/helloController';
import { createSwaggerRoute } from 'swagger-express-easy';

const router = express.Router();

createSwaggerRoute({
  method: 'get',
  path: '/api/hello',
  description: { text: 'Returns a hello message' },
});

createSwaggerRoute({
  method: 'get',
  path: '/api/hello/:id',
  description: { text: 'Returns a hello message and id' },
  parameters: [
    {
      value: '123',
      in: 'path',
      name: 'id',
      required: true,
      schema: { type: 'string' },
      description: 'ID of the hello message',
    },
  ],
});

createSwaggerRoute({
  method: 'post',
  path: '/api/hello',
  body: { message: 'Hello there!' },
  description: { text: 'Handles a hello post request' },
});

createSwaggerRoute({
  method: 'post',
  path: '/api/hello/user',
  description: { text: 'Creates a new user' },
  body: { name: 'Default User', age: 30 },
});

router.get('/:id', getHelloById);

router.get('/', getHelloById);

router.post('/', postHello);
router.post('/user', postUser);
router.get('/hi/from/lib', getHello);

export default router;
