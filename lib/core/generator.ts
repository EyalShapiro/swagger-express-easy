import swaggerAutogenFactory from 'swagger-autogen';
import path from 'path';
import type { Express } from 'express';

import type { ResolvedSwaggerConfig } from '../types/internal';
import type { SwaggerDocument } from '../types/swagger';
import { readJsonFile, writeJsonFile } from '../utils/fs-helper';
import { resolveEndpoints } from './endpoints';
import { mergeDynamicRoutes, mergeManualRoutes, injectSecuritySchemes } from './merger';

const DEFAULT_SWAGGER_ROUTE_FILES = [
  './src/app.ts',
  './src/app.js',

  './src/**/*.router.ts',
  './src/**/*.router.js',

  './src/**/*router.ts',
  './src/**/*router.js',

  './src/**/*routes.ts',
  './src/**/*routes.js',

  './src/routers/**/*.ts',
  './src/routers/**/*.js',
];

/**
 * Runs swagger-autogen on resolved endpoints and ensures the document has a valid version.
 *
 * @param {string} fullPath - The absolute path of the swagger output JSON file.
 * @param {ResolvedSwaggerConfig} config - Fully resolved Swagger configuration.
 * @returns {Promise<SwaggerDocument>} The loaded base swagger document.
 */
async function runSwaggerAutogen(
  fullPath: string,
  config: ResolvedSwaggerConfig,
): Promise<SwaggerDocument> {
  const autogenOptions = {
    openapi: '3.0.0',
    autoHeaders: true,
    autoBody: true,
    autoQuery: true,
    autoResponse: true,
    disableLogs: true,
  };

  const isDefaultList = !config?.endpointsRoutes;
  const rawEndpoints = config?.endpointsRoutes || DEFAULT_SWAGGER_ROUTE_FILES;
  const endpoints = resolveEndpoints(rawEndpoints, isDefaultList);

  await swaggerAutogenFactory(autogenOptions)(fullPath, endpoints, config?.document ?? {});

  const doc: SwaggerDocument = readJsonFile<SwaggerDocument>(fullPath) ?? {};
  if (!doc.openapi) {
    doc.openapi = '3.0.0';
  }
  return doc;
}

/**
 * Generates the final OpenAPI document by:
 * 1. Running `swagger-autogen` for comment-based annotations.
 * 2. Scanning the live Express app for dynamically registered routes.
 * 3. Merging manual route definitions from `SwaggerRouteStore`.
 * 4. Injecting security schemes from the resolved config.
 *
 * @param {Express} app - The Express application instance.
 * @param {ResolvedSwaggerConfig} config - Fully resolved Swagger configuration.
 * @returns {Promise<SwaggerDocument>} The generated OpenAPI 3.0 document.
 * @example
 * const doc = await generateDocument(app, buildSwaggerConfig({ outputFile: './swagger.json' }));
 */
export async function generateDocument(
  app: Express,
  config: ResolvedSwaggerConfig,
): Promise<SwaggerDocument> {
  const fullPath = path.resolve(process.cwd(), config?.outputFile ?? 'swagger.json');

  const doc = await runSwaggerAutogen(fullPath, config);

  mergeDynamicRoutes(doc, app, config?.caseSensitive ?? false);

  mergeManualRoutes(doc, config?.caseSensitive ?? false);

  injectSecuritySchemes(doc, config?.security);

  writeJsonFile(fullPath, doc);

  return doc;
}
