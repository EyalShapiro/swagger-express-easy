import dotenv from 'dotenv';
dotenv.config({ path: ['.env.local'], debug: false, quiet: false });

import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import { setupSwagger, SwaggerAuto } from 'swagger-express-easy';

import router from './routes/index';
import { errorHandler, notFound404Handle } from './middlewares/errorHandler';
import { HOST, PORT } from './config';
import { addTimeStamp } from './middlewares/timeStamp';
import { corsOptions } from './middlewares/cors';
import outersRouter from './outers';
import weatherRouter from './routes/weather';

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
  res.status(200).send(`<div style='${style}'><h1>pong</h1></div>`).sendStatus(200);
});

app.get('/status', (_req, res) => {
  res.jsonp({ status: 'Running', timestamp: new Date().toISOString(), uptime: process.uptime() });
});

app2.get('/', (_req, res) => res.send('Hello World from app2!'));
// Use outersRouter under /myApi for the secondary app
app2.use('/myApi', outersRouter);
// Primary app routes
app.use('/api', router);
app.use('/weather', weatherRouter);
// Optional additional API version
app.use('/api2', router);
app.param('id', function (_req, _res, next, id) {
  console.log('CALLED ONLY ONCE', id);
  next();
});
// Initialize Swagger instances
const swagger = new SwaggerAuto(app, {
  path: '/api-docs',
  watch: true,
  debug: process.env.NODE_ENV !== 'production',
  outputFile: './swagger.json',
  outputDir: './swagger',
  bearerAuth: true,
  tagsOrder: ['fun', 'calculate', 'circle-area'],
  swaggerUiOptions: {
    customSiteTitle: 'Eyal API Docs',
  },
});

// Startup function to handle async setup in correct order
async function startServer() {
  try {
    // 1. Setup Swagger docs first
    await swagger.setup();
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

    // 2. Register global handlers AFTER swagger routes
    app.use(notFound404Handle);
    app.use(errorHandler);

    // 3. Start Instance 1
    swagger.listen(PORT, () => {
      console.info(`\n\x1b[32m[Main] Server running on http://${HOST}\x1b[0m`);
      console.info(`\x1b[32m[Main] Swagger UI at http://${HOST}/api-docs\x1b[0m`);
    });

    // 4. Start Instance 2
    // const port2 = PORT + 1;
    // const host2 = HOST.replace(PORT.toString(), port2.toString());

    // const instance2 = swagger2.listen(port2, () => {
    //   console.info(`\x1b[32m[Secondary] Server running on http://${host2}\x1b[0m`);
    //   console.info(`\x1b[32m[Secondary] Swagger UI at http://${host2}/api-docs2\x1b[0m`);
    // });

    // console.info(`[Status] Instance 1 on port ${port}, Instance 2 on port ${instance2.port}`);
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

if (process.env.SWAGGER !== 'true') {
  startServer();
}
