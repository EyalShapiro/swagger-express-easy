import { Router, Request, Response } from 'express';
import { createSwaggerRoute } from '../../../lib/swagger/routeStore/index';

const router = Router();

// Endpoint returning plain text
createSwaggerRoute({
  method: 'get',
  path: '/api/v1/data/export/text',
  description: { text: 'Export system logs as plain text.' },
  tags: ['Data Management'],
  produces: ['text/plain'],
  responses: {
    200: { description: 'Plain text log file' }
  }
});
router.get('/export/text', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/plain');
  res.send('Log 1: System started\nLog 2: Database connected\nLog 3: User logged in');
});

// Endpoint returning CSV
createSwaggerRoute({
  method: 'get',
  path: '/api/v1/data/export/csv',
  description: { text: 'Export user data as a CSV file.' },
  tags: ['Data Management'],
  produces: ['text/csv'],
  responses: {
    200: { description: 'CSV file download' }
  }
});
router.get('/export/csv', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="users.csv"');
  res.send('id,name,email\n1,Eyal,eyal@example.com\n2,John,john@example.com');
});

// Search data endpoint
createSwaggerRoute({
  method: 'post',
  path: '/api/v1/data/search',
  description: { text: 'Search data based on dynamic filters.' },
  tags: ['Data Management'],
  consumes: ['application/json'],
  produces: ['application/json'],
  body: {
    type: 'object',
    properties: {
      query: { type: 'string', example: 'Eyal' },
      limit: { type: 'number', example: 10 }
    },
    required: ['query']
  },
  responses: {
    200: { description: 'Search results' },
    400: { description: 'Missing query parameter' }
  }
});
router.post('/search', (req: Request, res: Response) => {
  const { query, limit = 10 } = req.body;
  if (!query) {
    return res.status(400).json({ error: 'Search query is required' });
  }
  
  res.json({
    message: `Search successful for '${query}'`,
    results: [{ id: 1, match: query }],
    limitApplied: limit
  });
});

export default router;
