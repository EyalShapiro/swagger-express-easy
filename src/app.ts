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

const app = express();

app.use(express.json());
app.use(morgan('dev'));
app.use(cors(corsOptions));
app.use(express.json({ limit: '16kb' }));

app.use(addTimeStamp);

app.get('/', (_req, res) => res.send('Hello World!'));
app.get('/ping', (_req, res) => {
  const style = `display: flex; width: 100%;  height: 100%;
    flex-wrap: nowrap; align-items: center; justify-content: center; color: blue;`;
  res.status(200).send(`<div style='${style}'><h1>pong</h1></div>`);
});
app.get('/status', (req, res) => {
  res.jsonp({
    status: 'Running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.use('/api', router);

app.use(notFound404Handle);
app.use(errorHandler);

const swagger = new SwaggerAuto(app, {
  path: '/api-docs',
  watch: true,
  endpointsRoutes: ['./src/app.ts', './src/routes/*.ts'],
  // Optional: specify the path to the auto-generated JSON file.
  // If not provided, it defaults to './swagger.json'.
  outputFile: './swagger.json',

  // Optional: specify the directory where the JSON file should be written.
  // If not provided, it defaults to the current working directory.
  outputDir: './dist',
});

(async function startServer() {
  try {
    await swagger.setup();

    // The new one-liner: handles listen, dynamic port detection, and EADDRINUSE errors!
    swagger.listen(PORT, () => {
      console.info(`\n\x1b[32mServer running on http://${HOST}\x1b[0m`);
      if (!IS_PROD) console.info(`\x1b[32mSwagger UI at http://${HOST}/api-docs\x1b[0m`);
    });
  } catch (error) {
    console.error('\x1b[31mFailed to start server:\x1b[0m', error);
    process.exit(1);
  }
})();

