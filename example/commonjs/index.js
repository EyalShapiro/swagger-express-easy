const express = require('express');
const { setupSwagger } = require('swagger-express-easy');
const { adminRouter } = require('./adminRouter');

const app = express();

app.use(express.json());

/**

* Basic route
  */
app.get('/', (req, res) => {
  res.send('Swagger Express Easy - CommonJS Example');
});

/**

* Query parameters
* GET /users?id=123
  */
app.get('/users', (req, res) => {
  const { id } = req.query;

  res.json({
    type: 'query',
    id,
  });
});

/**

* Path parameter
* GET /users/123
  */
app.get('/users/:id', (req, res) => {
  res.json({
    type: 'path',
    id: req.params.id,
  });
});

/**

* Multiple path parameters
* GET /users/123/posts/456
  */
app.get('/users/:userId/posts/:postId', (req, res) => {
  res.json({
    userId: req.params.userId,
    postId: req.params.postId,
  });
});

/**

* Request body
  */
app.post('/users', (req, res) => {
  res.status(201).json({
    message: 'User created',
    body: req.body,
  });
});

/**

* PUT
  */
app.put('/users/:id', (req, res) => {
  res.json({
    message: 'User updated',
    id: req.params.id,
    body: req.body,
  });
});

/**

* DELETE
  */
app.delete('/users/:id', (req, res) => {
  res.json({
    message: 'User deleted',
    id: req.params.id,
  });
});

/**

* Headers example
  */
app.get('/headers', (req, res) => {
  res.json({
    authorization: req.headers.authorization,
  });
});

app.use('/admin', adminRouter);

async function start() {
  await setupSwagger(app, {
    path: '/api-docs',
    outputFile: './swagger.json',
  });

  app.listen(3000, () => {
    console.log('Server running at http://localhost:3000');
    console.log('Swagger UI at http://localhost:3000/api-docs');
  });
}

start();
