import { Router } from 'express';
import { getWeatherByCity, updateWeatherReport } from '../controllers/weatherController';
import { createSwaggerRoutes } from 'swagger-express-easy';

const router = Router();

// Express routes definition
router.get('/:city', getWeatherByCity);
router.post('/:city', updateWeatherReport);

// Centralized Swagger Documentation using createSwaggerRoutes array
createSwaggerRoutes([
  {
    method: 'get',
    path: '/api/weather/{city}',
    description: { text: 'Get current weather for a specific city.' },
    tags: ['Weather API'],
    parameters: [
      {
        name: 'city',
        in: 'path',
        required: true,
        type: 'string',
        description: 'Name of the city (e.g., london, telaviv, newyork)',
      },
    ],
    responses: {
      200: { description: 'Successful response with weather data' },
      404: { description: 'City not found in database' },
    },
  },
  {
    method: 'post',
    path: '/api/weather/{city}',
    description: { text: 'Update or submit a new weather report for a city.' },
    tags: ['Weather API'],
    parameters: [
      {
        name: 'city',
        in: 'path',
        required: true,
        type: 'string',
        description: 'Name of the city to update',
      },
    ],
    body: {
      type: 'object',
      properties: {
        temp: { type: 'number', example: 25 },
        condition: { type: 'string', example: 'Sunny' },
      },
      required: ['temp', 'condition'],
    },
    responses: {
      201: { description: 'Weather report successfully updated' },
      400: { description: 'Bad Request - missing temp or condition' },
    },
  },
]);

export default router;
