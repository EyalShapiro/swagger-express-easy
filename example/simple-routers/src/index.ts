import { createServer } from 'http';
import express from 'express';
import { setupSwagger } from 'swagger-express-easy';

import { router } from './routes';

const app = express();

app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

app.use('/api', router);

setupSwagger(app, {
  watch: true,

  document: {
    info: {
      title: 'Simple Routers Example',
      version: '1.0.0',
      description: 'A tiny example combining @SwaggerRoute and withSwagger',
    },
  },
  endpointsRoutes: ['./src/index.ts', 'routes/index.ts'],
  outputFile: './swagger-output.json',
});
const PORT = 3002;
const url = `http://localhost:${PORT}`;
createServer(app).listen(PORT, () => {
  console.info(`Server is running on ${url}`);
  console.info(`Swagger UI is available at ${url}/api-docs`);
});
