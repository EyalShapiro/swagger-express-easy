import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import http from 'http';
import morgan from 'morgan';
import cors from 'cors';
import { SwaggerAuto } from 'swagger-express-easy';

import router from './routes';
import { errorHandler, notFound404Handle } from './middlewares/errorHandler';
import { HOST, IS_PROD, PORT } from './config';
import { addTimeStamp } from './middlewares/timeStamp';
import { corsOptions } from './middlewares/cors';
import outersRouter from './outers';

const app = express();
const app2 = express();

app.use(express.json());
app.use(morgan('dev'));
app.use(cors(corsOptions));
app.use(express.json({ limit: '16kb' }));

app.use(addTimeStamp);
app.use('/assets', express.static('assets'));

app.get('/', (_req, res) => res.send('Hello World!'));
app.get('/ping', (_req, res) => {
  const style = `display: flex; width: 100%;  height: 100%;
    flex-wrap: nowrap; align-items: center; justify-content: center; color: blue;`;
  res.status(200).send(`<div style='${style}'><h1>pong</h1></div>`);
});
app.get('/status', (req, res) => {
  res.jsonp({ status: 'Running', timestamp: new Date().toISOString(), uptime: process.uptime() });
});
app2.get('/', (_req, res) => res.send('Hello World from app2!'));
app2.use('/myApi', outersRouter);

app.use('/api', router);
app.use(outersRouter);
app.use('/api2', router);

app.use(notFound404Handle);
app.use(errorHandler);

const swagger = new SwaggerAuto(app, {
  path: '/api-docs',
  watch: true,
  endpointsRoutes: ['./src/app.ts'],
  outputFile: './swagger.json',
  outputDir: './dist',
  swaggerUiOptions: {
    customSiteTitle: 'My Awesome API Docs',
    customCss: '.swagger-ui .topbar { display: none }', // Hide topbar for a cleaner look
    customfavIcon: '/assets/favicon.png', // Using the generated favicon
  },
});
const swagger2 = new SwaggerAuto(app2, {
  path: '/api-docs2',
  watch: false,
  basePath: 'myApi',
  endpointsRoutes: ['./src/app.ts'],
  outputFile: './swagger-examples.json',
  outputDir: './dist',
});

(async function startServer() {
  try {
    await swagger.setup();
    await swagger2.setup();

    // Demonstrate the new return value: { server, app, port }
    const { server, port } = swagger.listen(PORT, () => {
      console.info(`\n\x1b[32m[Main] Server running on http://${HOST}\x1b[0m`);
      console.info(`\x1b[32m[Main] Swagger UI at http://${HOST}/api-docs\x1b[0m`);
    });

    const port2 = PORT + 1;
    const host2 = HOST.replace(PORT.toString(), port2.toString());

    // Also use the new return value for the second server
    const instance2 = swagger2.listen(port2, () => {
      console.info(`\x1b[32m[Secondary] Server running on http://${host2}\x1b[0m`);
      console.info(`\x1b[32m[Secondary] Swagger UI at http://${host2}/api-docs2\x1b[0m`);
    });

    // You can now access server or app directly from the return value
    console.log(`[Status] Instance 1 on port ${port}, Instance 2 on port ${instance2.port}`);
  } catch (error) {
    console.error('\x1b[31mFailed to start server:\x1b[0m', error);
    process.exit(1);
  }
})();
