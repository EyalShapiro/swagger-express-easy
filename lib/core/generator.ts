import swaggerAutogenFactory from 'swagger-autogen';
import type { ResolvedSwaggerConfig } from '../types/internal';
import type { SwaggerDocument } from '../types/swagger';
import { parseRoutes } from './parser';
import { scanRoutes } from './scanner';
import { SwaggerRouteStore } from '../swagger/routeStore';
import type { Express } from 'express';
import path from 'path';
import { getCleanBasePath, normalizePath } from '../utils/path';
import { readJsonFile, writeJsonFile } from '../utils/fs-helper';

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
  const autogenOptions = {
    openapi: '3.0.0',
    autoHeaders: true,
    autoBody: true,
    autoQuery: true,
    autoResponse: true,
  };

  const generator = swaggerAutogenFactory(autogenOptions);
  const fullPath = path.resolve(process.cwd(), config?.outputFile ?? 'swagger.json');

  const endpoints = (config?.endpointsRoutes || ['./src/app.ts']).map((f) =>
    path.resolve(process.cwd(), f),
  );

  // Run swagger-autogen to get base doc
  await generator(
    fullPath,
    endpoints,
    (config?.document ?? {}) as unknown as Record<string, unknown>,
  );

  // Read generated doc
  const doc: SwaggerDocument = readJsonFile<SwaggerDocument>(fullPath) ?? {};

  // Scan and parse dynamic routes
  const rawRoutes = scanRoutes(app);
  const parsed = parseRoutes(rawRoutes, config?.caseSensitive ?? false);

  // Merge parsed dynamic routes into doc
  doc.paths = doc.paths ?? {};
  for (const [p, methods] of Object.entries(parsed.paths)) {
    if (!doc.paths[p]) {
      doc.paths[p] = methods;
    } else {
      // Merge methods
      Object.assign(doc.paths[p], methods);
    }
  }

  // Inject manual routes from SwaggerRouteStore
  const customRoutes = SwaggerRouteStore.getRouteList();
  for (const route of customRoutes) {
    const rawPath = config?.caseSensitive ? route?.path : route?.path?.toLowerCase();
    const normalizedPath = getCleanBasePath(normalizePath(rawPath)) || '/';

    if (!doc.paths[normalizedPath]) {
      doc.paths[normalizedPath] = {};
    }

    const pathItem = doc.paths[normalizedPath] as Record<string, unknown>;
    pathItem[route.method] = {
      ...(pathItem[route.method] ?? {}),
      summary: route?.description?.summary,
      description: route?.description?.text,
      tags: route?.tags ?? (route?.tag ? [route.tag] : undefined),
      deprecated: route?.deprecated,
      security: route?.security,
    };
    if (route?.body) {
      (pathItem[route.method] as Record<string, unknown>).requestBody = {
        content: { 'application/json': { schema: route.body } },
      };
    }
    if (route?.responses) {
      const methodObj = pathItem[route.method] as Record<string, unknown>;
      methodObj.responses = Object.assign(methodObj.responses || {}, route.responses);
    }
  }

  // Inject security schemes
  if (config?.security) {
    doc.components = doc?.components || {};
    doc.components.securitySchemes = {
      ...(doc.components?.securitySchemes || {}),
      ...config.security,
    };
  }

  writeJsonFile(fullPath, doc);

  return doc;
}
