import { Express } from 'express';
import { SwaggerAuto, SwaggerSetupOptions } from './swagger';
import { defineSchema, schemaRef } from './swagger/schemas';
import { createSwaggerRoute } from './swagger/routeStore';
import { withSwagger, SwaggerRoute } from './swagger/decorators';

/**
 * Re-export core classes and types.
 */
export * from './swagger';
export * from './swagger/swagger-config';
export * from './swagger/schemas';
export * from './swagger/routeStore';
export * from './swagger/decorators';
export * from './swagger/utils/path-helper';

/**
 * High-level function to set up Swagger in an Express application.
 *
 * @param app - The Express application instance.
 * @param options - Configuration options for Swagger.
 */
export async function setupSwagger(app: Express, options: SwaggerSetupOptions = {}) {
  const swagger = new SwaggerAuto(app, options);
  return swagger.setup();
}

/**
 * Export a default object for convenience.
 */
export const SwaggerExpressEasy = {
  SwaggerAuto,
  setupSwagger,
  defineSchema,
  schemaRef,
  createSwaggerRoute,
  withSwagger,
  SwaggerRoute,
};

export default SwaggerExpressEasy;
