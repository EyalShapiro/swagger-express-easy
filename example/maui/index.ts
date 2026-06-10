import express from 'express';
import { setupSwagger } from 'swagger-express-easy';

const app = express();

app.get('/hi/:id', (req, res) => res.json({ success: true, name: 'Eyal', id: req.params.id }));

app.get('/data', (_req, res) => res.json({ success: true }));
app.use((_req, res, next) => {
  console.info('Time:', Date.now());
  next();
});
async function start() {
  await setupSwagger(app, {
    path: '/api-docs',
    outputFile: './swagger.json',
    // Example of dynamic base path for MAUI
    basePath:
      process.env.MAUI_PLATFORM === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000',
  });

  app.listen(3000, () => {
    console.log('Server running on port 3000');
  });
}

start();
