import { Router } from 'express';
import multer from 'multer';
import { withSwagger } from 'swagger-express-easy';

const router = Router();
const uploader = multer({ storage: multer.memoryStorage() });

router.post(
  '/upload',
  uploader.single('singleFile'),
  withSwagger(
    {
      method: 'post',
      path: '/api/files-v1/upload',
      description: { text: 'Upload a single file' },
      consumes: ['multipart/form-data'],
      parameters: [
        {
          in: 'formData',
          name: 'singleFile',
          type: 'file',
          required: true,
          description: 'Upload a text file to read its content',
        },
      ],
      tags: ['Files V1'],
    },
    async (req, res) => {
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
    },
  ),
);

// Upload multiple files using Multer
router.post(
  '/uploads',
  uploader.array('multFiles', 5),
  withSwagger(
    {
      method: 'post',
      path: '/api/files-v1/uploads',
      description: { text: 'Upload multiple files' },
      consumes: ['multipart/form-data'],
      parameters: [
        {
          in: 'formData',
          name: 'multFiles',
          type: 'array',
          required: true,
          description: 'Upload up to 5 files',
          collectionFormat: 'multi',
          items: { type: 'file' },
        },
      ],
      tags: ['Files V1'],
    },
    (req, res) => {
      const files = req.files;
      console.info('Uploaded file info:', files);
      res.json({ message: 'File uploaded successfully', files });
    },
  ),
);
export default router;
