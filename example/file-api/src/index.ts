import express from 'express';
import { SwaggerAuto } from 'swagger-express-easy';
import routes from './routes';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Mount the API routes
app.use(routes);

// Initialize Swagger Auto-Generation
const swagger = new SwaggerAuto(app, {
  path: '/api-docs',
  watch: true,
  endpointsRoutes: ['./src/routes.ts'],
  document: {
    info: {
      title: 'File System API',
      version: '1.0.0',
      description: 'An example API demonstrating complex schemas with `defineEntityFromExample`',
    },
  },
});

async function start() {
  await swagger.setup();
  
  app.listen(port, () => {
    console.log(`\n🚀 Server running on http://localhost:${port}`);
    console.log(`📚 Swagger UI available at http://localhost:${port}/api-docs\n`);
  });
}

start();
