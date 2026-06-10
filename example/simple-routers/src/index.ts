import { createServer } from 'http';
import express from 'express';
import { setupSwagger } from 'swagger-express-easy';

import { router } from './routes';
import { requestTimeLogger } from './middlewares/requestTimeLogger';

const app = express();

app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));
app.use(requestTimeLogger());
app.use('/api', router);
app.get('/', (req, res) => {
  res.status(200).json({ statusCode: res.statusCode, msg: 'eyal sand hi' });
});

setupSwagger(app, {
  watch: true,

  document: {
    info: {
      title: 'Simple Routers Example',
      version: '1.0.0',
      description: 'A tiny example combining @SwaggerRoute and withSwagger',
    },
  },
  outputFile: './swagger-output.json',
});
const PORT = 3002;
const url = `http://localhost:${PORT}`;
createServer(app).listen(PORT, () => {
  console.info(`Server is running on ${url}`);
  console.info(`Swagger UI is available at ${url}/api-docs`);
});
