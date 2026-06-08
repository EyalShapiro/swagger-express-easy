import swaggerAutogenFactory from 'swagger-autogen';
import type { ResolvedSwaggerConfig } from '../types/internal';
import type { SwaggerDocument } from '../types/swagger';
import { parseRoutes } from './parser';
import { scanRoutes } from './scanner';
import { SwaggerRouteStore } from '../swagger/routeStore';
import type { Express, Request } from 'express';
import path from 'path';
import fs from 'fs';
import { getCleanBasePath, normalizePath } from '../utils/path';
import { readJsonFile, writeJsonFile } from '../utils/fs-helper';

const warnedFiles = new Set<string>();

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

  const rawEndpoints = config?.endpointsRoutes || DEFAULT_SWAGGER_ROUTE_FILES;
  const endpoints: string[] = [];

  for (const filePattern of rawEndpoints) {
    const resolvedPath = path.resolve(process.cwd(), filePattern);
    const isGlob = /[*?{}[\]]/.test(filePattern);

    if (isGlob) {
      endpoints.push(resolvedPath);
    } else {
      if (fs.existsSync(resolvedPath)) {
        endpoints.push(resolvedPath);
      } else {
        if (!warnedFiles.has(resolvedPath)) {
          warnedFiles.add(resolvedPath);
          console.warn(
            `\x1b[33m[swagger-express-easy] Warning: Route file/configuration not found at "${resolvedPath}". Ignoring.\x1b[0m`,
          );
        }
      }
    }
  }
  // Run swagger-autogen to get base doc
  await generator(
    fullPath,
    endpoints,
    (config?.document ?? {}) as unknown as Record<string, unknown>,
  );

  // Read generated doc
  let doc: SwaggerDocument = readJsonFile<SwaggerDocument>(fullPath) ?? {};
  // Ensure OpenAPI version field exists
  if (!doc.openapi) {
    doc.openapi = '3.0.0';
  }

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

    // Merge and inject parameters
    const existingParams = (pathItem[route.method] as Record<string, unknown>)?.parameters;
    const parameters: any[] = [];

    if (Array.isArray(existingParams)) parameters.push(...existingParams);

    const upsertParameter = (param: any) => {
      const idx = parameters.findIndex((p) => p.name === param.name && p.in === param.in);
      if (idx !== -1) {
        parameters[idx] = { ...parameters[idx], ...param };
      } else {
        parameters.push(param);
      }
    };

    if (route.parameters) route.parameters.forEach((p) => upsertParameter(p));

    const addParams = (source: keyof Request, sourceData?: Record<string, any>) => {
      if (!sourceData) return;
      for (const [name, val] of Object.entries(sourceData)) {
        const item: Record<string, any> = {
          name,
          in: source,
          required: source === 'path' ? true : false,
          schema: { type: 'string' },
        };
        if (typeof val === 'string') {
          item.description = val;
        } else if (val && typeof val === 'object') {
          if (val.type) item.schema.type = val.type;
          if (val.required !== undefined) item.required = val.required;
          if (val.description) item.description = val.description;
          if (val.schema) {
            item.schema = { ...item.schema, ...val.schema };
          }
        }
        upsertParameter(item);
      }
    };
    for (const [location, params] of [
      ['path', route.params],
      ['query', route.query],
      ['header', route.headers],
      ['cookies', route.cookies],
    ] as const) {
      addParams(location, params);
    }
    if (parameters.length > 0) {
      const methodObj = pathItem[route.method] as Record<string, unknown>;
      methodObj.parameters = Object.assign(methodObj.parameters || {}, parameters);
    }

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
