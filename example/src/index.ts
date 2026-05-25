import dotenv from 'dotenv';
import { setupSwagger, SwaggerAuto } from '../../dist';
import app from './app';
import app2 from './app2';
import { HOST, PORT } from './config';

dotenv.config({ path: ['.env.local'], debug: false, quiet: false });
// Initialize Swagger instances
const swagger = new SwaggerAuto(app, {
  path: '/api-docs',
  watch: true,
  debug: process.env.NODE_ENV !== 'production',
  outputFile: './swagger.json',
  outputDir: './swagger',
  bearerAuth: { description: 'Enter JWT Bearer token here' },
  apiKeyAuth: { name: 'X-API-Key', in: 'header' },
  caseSensitive: false,
  tagsOrder: ['fun', 'calculate', 'circle-area'],
  swaggerUiOptions: {
    customSiteTitle: 'Eyal API Docs',
  },
});
// Startup function to handle async setup in correct order
async function startServer() {
  try {
    await swagger.setup();

    // Demonstrate mounting custom Swagger middleware on another route manually
    app.use('/api-docs-custom', swagger.middleware());

    await setupSwagger(app2, {
      path: '/api-docs2',
      watch: false,
      basePath: 'myApi',
      debug: process.env.NODE_ENV !== 'production',
      outputFile: './swagger-examples.json',
      outputDir: './swagger',
      bearerAuth: true,

      swaggerUiOptions: {
        customSiteTitle: 'My Awesome API Docs',
        customCss: '.swagger-ui .topbar { display: none }',
        customfavIcon: '/assets/favicon.png',
      },
    });

    swagger.listen(PORT, () => {
      console.info(`\n\x1b[32m[Main] Server running on http://${HOST}\x1b[0m`);
      console.info(`\x1b[32m[Main] Swagger UI at http://${HOST}/api-docs\x1b[0m`);
      console.info(`\x1b[32m[Main] Custom Swagger UI at http://${HOST}/api-docs-custom\x1b[0m`);
    });
  } catch (error) {
    console.error('\x1b[31mFailed to start server:\x1b[0m', error);
    process.exit(1);
  }
}

process.on('SIGTERM', () => {
  console.debug('SIGTERM signal received: closing HTTP server');
  swagger.getApp().on('close', () => {
    console.debug('HTTP server 1 closed');
    process.exit(0);
  });
  swagger.getApp().on('error', () => {
    console.debug('HTTP error');
    process.exit(1);
  });
  process.exit(1);
});
startServer();

process.on('SIGTERM', () => {
  console.debug('SIGTERM signal received: closing HTTP server');
  swagger.getApp().on('close', () => {
    console.debug('HTTP server 1 closed');
    process.exit(0);
  });
  swagger.getApp().on('error', () => {
    console.debug('HTTP error');
    process.exit(1);
  });
  process.exit(1);
});
