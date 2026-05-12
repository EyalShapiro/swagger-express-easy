// ============================================================
//  swagger-express-easy — Public API
// ============================================================

// --- Main Engine ---
export { SwaggerAuto, setupSwagger, getSwaggerDocument, handleServerErrors } from './swagger/index';
export type { SwaggerSetupOptions } from './swagger/index';

// --- Config ---
export { buildSwaggerConfig, SWAGGER_CONFIG } from './swagger/swagger.config';
export type {
  SwaggerConfigOptions,
  SwaggerInfoConfig,
  SwaggerServerConfig,
} from './swagger/swagger.config';

// --- Route-store (annotate routes programmatically) ---
export { SwaggerRouteStore, createSwaggerRoute, createSwaggerRoutes } from './swagger/routeStore';

// --- Decorators & Wrappers ---
export { SwaggerRoute, withSwagger } from './swagger/decorators';

// --- Schema / Entity Manager ---
export {
  SchemaManager,
  defineSchema,
  schemaRef,
  getRegisteredSchemas,
  clearSchemas,
  defineResponseProperties,
} from './swagger/schemas';
export type { SchemaPropertyType, SchemaPropertyDef, OpenAPISchema } from './swagger/schemas';

// --- Types ---
export type { SwaggerRouteDefinition, HTTPMethod, ParametersType } from './swagger/routeStore/type';

// --- Low-level utilities ---
export {
  readSwaggerFile,
  updateSwaggerFile,
  checkSwaggerFile,
  normalizePath,
  getSwaggerFilePath,
} from './swagger/utils/functions';

// --- Generation ---
export { generateSwaggerDocs } from './swagger/swaggerAuto';
