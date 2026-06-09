import express from 'express';
import multer from 'multer';
import { setupSwagger } from 'swagger-express-easy';

const app = express();
const upload = multer({ dest: 'uploads/' });

// Single file upload
app.post('/upload', upload.single('file'), (req, res) => {
  res.json({ message: 'Single file uploaded' });
});

// Array of files
app.post('/photos', upload.array('photos', 10), (req, res) => {
  res.json({ message: 'Photos uploaded' });
});

// Mixed fields
app.post('/mixed', upload.fields([
  { name: 'avatar', maxCount: 1 },
  { name: 'gallery', maxCount: 8 }
]), (req, res) => {
  res.json({ message: 'Mixed files uploaded' });
});

async function start() {
  await setupSwagger(app, {
    path: '/docs',
    outputFile: './swagger.json'
  });

  app.listen(3000, () => {
    console.log('Server running at http://localhost:3000');
    console.log('Swagger UI at http://localhost:3000/docs');
  });
}

start();
