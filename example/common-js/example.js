const express = require('express');
const { SwaggerAuto } = require('../dist/index.js'); // Use compiled file for the example

const app = express();
app.use(express.json());

// Example route
app.get('/hello', (req, res) => {
  res.json({ message: 'Hello World' });
});

app.post('/echo', (req, res) => {
  res.json({ echoed: req.body });
});
app.post('/hi', (req, res) => {
  const { message, num } = req.body;
  res.json({ myMessage: message, myNum: num });
});

const swagger = new SwaggerAuto(app, {
  path: '/api-docs',
  watch: true,
  endpointsRoutes: [__filename], // Tell swagger-autogen to read this file
  outputFile: './example/swagger-example-2.json',
});

async function start() {
  await swagger.setup();

  swagger.listen(3001, () => {
    console.log('Example JS App running on http://localhost:3001');
    console.log('Swagger UI available at http://localhost:3001/api-docs');
  });
}

start();
