import express from 'express';
import { setupSwagger } from 'swagger-express-easy';
import { router } from './routes';

const app = express();
app.use(express.json());

app.use('/api', router);

setupSwagger(app as any, {
  document: {
    info: {
      title: 'Simple Routers Example',
      version: '1.0.0',
      description: 'A tiny example combining @SwaggerRoute and withSwagger',
    },
  },
  endpointsRoutes: ['./src/index.ts'],
  outputFile: './swagger-output.json',
});

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
  console.log('Swagger UI is available at http://localhost:3000/api-docs');
});
