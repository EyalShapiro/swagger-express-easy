import { Router } from 'express';
import { createSwaggerRoute, schemaRef } from 'swagger-express-easy';
import './schemas'; // Ensure schemas are registered

const router = Router();

createSwaggerRoute({
  method: 'get',
  path: '/api/files',
  tags: ['Files'],
  description: { summary: 'List all files' },
  responses: {
    200: {
      description: 'A list of files',
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: { $ref: schemaRef('FileInfo') },
          },
        },
      },
    },
  },
});
router.get('/api/files', (req, res) => {
  res.json([
    { name: 'index.ts', size: 1240, extension: '.ts' },
    { name: 'utils.ts', size: 850, extension: '.ts' },
  ]);
});

createSwaggerRoute({
  method: 'get',
  path: '/api/files/{name}',
  tags: ['Files'],
  description: { summary: 'Get file details' },
  responses: {
    200: {
      description: 'File details',
      content: {
        'application/json': { schema: { $ref: schemaRef('FileDetails') } },
      },
    },
    404: { description: 'File not found' },
  },
});
router.get('/api/files/:name', (req, res) => {
  res.json({
    name: req.params.name,
    size: 1024,
    extension: '.json',
    createdAt: new Date().toISOString(),
    modifiedAt: new Date().toISOString(),
    isDirectory: false,
  });
});

createSwaggerRoute({
  method: 'get',
  path: '/api/stats',
  tags: ['Stats'],
  description: { summary: 'Get directory statistics' },
  responses: {
    200: {
      description: 'Directory stats',
      content: {
        'application/json': { schema: { $ref: schemaRef('DirectoryStats') } },
      },
    },
  },
});
router.get('/api/stats', (req, res) => {
  res.json({
    totalFiles: 52,
    totalDirectories: 8,
    totalSize: 124000,
  });
});

createSwaggerRoute({
  method: 'get',
  path: '/api/project',
  tags: ['Project'],
  description: { summary: 'Get full project structure' },
  responses: {
    200: {
      description: 'Project structure',
      content: {
        'application/json': { schema: { $ref: schemaRef('ProjectStructure') } },
      },
    },
  },
});
router.get('/api/project', (req, res) => {
  res.json({
    projectName: 'MyAwesomeAPI',
    version: '1.0.0',
    isPrivate: true,
    rootDirectory: {
      path: '/',
      stats: { totalFiles: 52, totalDirectories: 8, totalSize: 124000 },
      files: [{ name: 'package.json', size: 1024, extension: '.json' }],
      metadata: { owner: 'Admin', lastScan: new Date().toISOString(), tags: ['nodejs', 'api'] },
    },
  });
});

export default router;
