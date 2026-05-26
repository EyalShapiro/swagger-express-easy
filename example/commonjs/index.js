const express = require('express');
const { setupSwagger } = require('swagger-express-easy');

const app = express();

app.get('/', (req, res) => res.send('CommonJS works'));

async function start() {
  await setupSwagger(app, {
    path: '/api-docs',
    outputFile: './swagger.json'
  });

  app.listen(3000, () => {
    console.log('Server running on port 3000');
  });
}

start();
