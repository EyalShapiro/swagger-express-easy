import express from 'express';
import { SwaggerManager } from 'swagger-express-easy';

const app = express();

app.get('/users', (req, res) => res.json([]));

async function start() {
  const swagger = new SwaggerManager(app, {
    path: '/api-docs',
    outputFile: './swagger.json',
  });

  await swagger.setup();

  app.listen(3000, () => {
    console.log('Server running on port 3000');
    console.log('Swagger UI on http://localhost:3000/api-docs');
  });
}

void start();
