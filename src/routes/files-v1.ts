import { Router } from 'express';
import multer from 'multer';

const router = Router();
const uploader = multer({ storage: multer.memoryStorage() });

router.post('/upload', uploader.single('singleFile'), async (req, res) => {
  /*
      #swagger.consumes = ['multipart/form-data']  
      #swagger.parameters['singleFile'] = {
          in: 'formData',
          type: 'file',
          required: true,
          description: 'Upload a text file to read its content'
      }
    */

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
router.post('/uploads', uploader.array('multFiles', 5), (req, res) => {
  /*
        #swagger.consumes = ['multipart/form-data']  
        #swagger.parameters['multFiles'] = {
            in: 'formData',
            type: 'array',
            required: true,
            description: 'Some description...',
            collectionFormat: 'multi',
            items: { type: 'file' }
        } */

  const files = req.files;
  console.info('Uploaded file info:', files);
  res.json({ message: 'File uploaded successfully', files });
});
export default router;
