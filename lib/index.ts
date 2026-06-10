import { SwaggerManager, setupSwagger } from './swagger/setup-swagger';
import { customSwaggerMiddleware } from './swagger/middleware';
import { defineSchema, defineEntity, defineEntityFromExample, schemaRef } from './swagger/schemas';
import { withSwagger, SwaggerRoute } from './swagger/decorators';
import { createSwaggerRoute } from './swagger/routeStore';

/**
 * High-level function to set up Swagger in an Express application.
 *
 * @param app - Express app instance.
 * @param options - Configuration options for Swagger.
 * @returns A promise that resolves when Swagger is fully set up.
 *
 * @example
 * setupSwagger(app, {
 *   path: '/docs',
 *   basePath: 'api/v1'
 * });
 */
export { setupSwagger };

/**
 * Custom middleware to serve Swagger UI without requiring a specific route structure.
 *
 * @param options - Configuration for the middleware including the document.
 * @returns Array of Express RequestHandlers.
 */
export { customSwaggerMiddleware };

export { SwaggerManager, SwaggerManager as SwaggerAuto, SwaggerManager as Swagger };
export { defineSchema, defineEntity, defineEntityFromExample, schemaRef };
export { withSwagger, SwaggerRoute, createSwaggerRoute };

export const SwaggerExpressEasy = {
  SwaggerManager,
  SwaggerAuto: SwaggerManager,
  Swagger: SwaggerManager,
  setupSwagger,
  customSwaggerMiddleware,
  defineSchema,
  defineEntity,
  defineEntityFromExample,
  schemaRef,
  withSwagger,
  SwaggerRoute,
  createSwaggerRoute,
};

export default SwaggerExpressEasy;
