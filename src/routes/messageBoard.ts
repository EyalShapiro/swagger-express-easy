import { Router } from 'express';
import { addMessage, clearMessages, getSizeMessages } from '../controllers/messageBoard.Controller';
import { createSwaggerRoute, defineSchema, schemaRef } from 'swagger-express-easy';

const router = Router();

// --- 1. Define our Models (Entities) ---

// Define the "Message" model
defineSchema('Message', {
  id: { type: 'integer', required: true, example: 1 },
  text: { type: 'string', required: true, example: 'Hello everyone!' },
  time: { type: 'string', format: 'date-time', example: '2024-05-06T20:00:00Z' },
  useName: { type: 'string', required: true, example: 'Eyal' },
  title: { type: 'string', example: 'General' },
});

// Define the request body for adding a message
defineSchema('AddMessageRequest', {
  text: { type: 'string', required: true },
  title: { type: 'string' },
  useName: { type: 'string', required: true },
});

// --- 2. Register Swagger Documentation ---

createSwaggerRoute({
  method: 'get',
  path: '/api/message-board',
  description: { text: 'Get all messages and the total count' },
});

createSwaggerRoute({
  method: 'post',
  path: '/api/message-board',
  description: { text: 'Add a new message to the board' },
  body: { $ref: schemaRef('AddMessageRequest') }, // Using the schema reference
});

createSwaggerRoute({
  method: 'delete',
  path: '/api/message-board',
  description: { text: 'Clear all messages from the board' },
});

// --- 3. Routes ---

router.get('/', getSizeMessages);
router.post('/', addMessage);
router.delete('/', clearMessages);

export default router;
