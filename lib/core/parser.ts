import type { ParsedRoute } from '../types/express';
import type { SwaggerOperation, SwaggerPathItem } from '../types/swagger';
import { normalizePath } from '../utils/path';

export interface ParseResult {
  paths: Record<string, SwaggerPathItem>;
}

/**
 * Parses raw Express routes into OpenAPI paths.
 * Also processes multer middleware to generate `multipart/form-data` request bodies.
 *
 * @param {ParsedRoute[]} routes - Raw routes from `scanRoutes()`.
 * @param {boolean} [isGlobalCaseSensitive=false] - Whether the app uses case-sensitive routing.
 * @returns {ParseResult} Object containing `paths` keyed by OpenAPI-formatted path string.
 * @example
 * const { paths } = parseRoutes(scanRoutes(app), false);
 */
export function parseRoutes(routes: ParsedRoute[], isGlobalCaseSensitive = false): ParseResult {
  const paths: Record<string, SwaggerPathItem> = {};

  for (const route of routes) {
    // Determine case sensitivity
    const isRouteCaseSensitive =
      route.meta.caseSensitive !== undefined ? route.meta.caseSensitive : isGlobalCaseSensitive;

    const rawPath = isRouteCaseSensitive ? route.path : route.path.toLowerCase();
    const openApiPath = normalizePath(rawPath);

    if (!paths[openApiPath]) {
      paths[openApiPath] = {};
    }

    const pathItem = paths[openApiPath] as Record<string, SwaggerOperation>;
    if (!pathItem[route.method]) {
      pathItem[route.method] = {
        responses: { 200: { description: 'OK' } },
      } as SwaggerOperation;
    }

    const op = pathItem[route.method] as SwaggerOperation;

    // Parse Multer
    const multerMetadata = parseMulterMiddlewares(route.middlewares);
    if (multerMetadata) {
      op.requestBody = {
        content: {
          'multipart/form-data': {
            schema: multerMetadata.schema,
          },
        },
      };
    }
  }

  return { paths };
}

function parseMulterMiddlewares(middlewares: ((...args: unknown[]) => unknown)[]) {
  let hasMulter = false;

  for (const mw of middlewares) {
    if (mw.name === 'multerMiddleware') {
      hasMulter = true;
      // In a real implementation we would extract field names using reflection or AST,
      // but Multer dynamically attaches itself.
      // For now, we provide a generic file array schema if multer is detected but specific fields aren't known.
      // A more advanced integration might use an injected property on `req.multerConfig` if available.
    }
  }

  if (hasMulter) {
    return {
      schema: {
        type: 'object',
        properties: {
          file: { type: 'string', format: 'binary' },
        },
      },
    };
  }

  return null;
}
