import { Router } from 'express';
import multer from 'multer';
import { createSwaggerRoute } from 'swagger-express-easy';

const router = Router();
const upload = multer({ dest: 'uploads/' });

// --- Controller Logic (Inline for example) ---

/**
 * Endpoint for uploading a profile picture.
 */
router.post('/profile-pic', upload.single('avatar'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  res.json({
    message: 'File uploaded successfully',
    fileInfo: {
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
    },
  });
});

// --- Register Swagger Documentation ---

createSwaggerRoute({
  method: 'post',
  path: '/api/files/profile-pic',
  description: { text: 'Upload a user profile picture (Multipart Form)' },
  consumes: ['multipart/form-data'],
  parameters: [
    {
      name: 'avatar',
      in: 'formData',
      required: true,
      type: 'file',
      description: 'The image file to upload',
    },
  ],
  tags: ['Files'],
});

export default router;
