import { Router } from 'express';
import multer from 'multer';

const fileUploadsRouter = Router();
const uploader = multer({ storage: multer.memoryStorage() });

fileUploadsRouter.post('/upload', uploader.single('singleFile'), async (req, res) => {
  const file = req.file;

  if (!file) {
    res.status(400).json({ message: 'No file uploaded', debugger: 'bug in backend!' });
    return;
  }

  // Read file content from memory
  const content = file.buffer.toString('utf8');

  console.log('Uploaded file:', file.originalname);
  console.log('Content:', content);

  res.json({
    message: 'File uploaded successfully',
    fileName: file.originalname,
    mimeType: file.mimetype,
    size: file.size,
    content,
  });
});

// Upload multiple files using Multer
fileUploadsRouter.post('/uploads', uploader.array('multFiles', 5), (req, res) => {
  const files = req.files;
  console.info('Uploaded file info:', files);
  res.json({ message: 'File uploaded successfully', files });
});
export { fileUploadsRouter };
