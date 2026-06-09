import express from 'express';
import { setupSwagger } from 'swagger-express-easy';

const app1 = express();
const app2 = express();

app1.get('/hello', (req, res) => res.send('App 1 Hello'));
app2.get('/world', (req, res) => res.send('App 2 World'));

async function start() {
  await setupSwagger(app1, {
    path: '/docs',
    outputFile: './swagger-app1.json',
    basePath: '/app1'
  });

  await setupSwagger(app2, {
    path: '/docs',
    outputFile: './swagger-app2.json',
    basePath: '/app2'
  });

  app1.listen(3001, () => console.log('App 1 at http://localhost:3001/docs'));
  app2.listen(3002, () => console.log('App 2 at http://localhost:3002/docs'));
}

start();
