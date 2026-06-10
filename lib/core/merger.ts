import type { Express } from 'express';
import type { SwaggerDocument, SwaggerParameter, SwaggerSecurityScheme } from '../types/swagger';
import { scanRoutes } from './scanner';
import { parseRoutes, autoDetectPathParameters } from './parser';
import { SwaggerRouteStore } from '../swagger/routeStore';
import type { SwaggerRouteDefinition } from '../swagger/routeStore/type';
import { getCleanBasePath, normalizePath } from '../utils/path';

/**
 * Scans the live Express application and merges its parsed routes into the Swagger document.
 *
 * @param {SwaggerDocument} doc - The Swagger/OpenAPI document to merge paths into.
 * @param {Express} app - The Express application instance.
 * @param {boolean} caseSensitive - Whether route path matching should be case-sensitive.
 * @returns {void}
 */
export function mergeDynamicRoutes(doc: SwaggerDocument, app: Express, caseSensitive: boolean) {
  const rawRoutes = scanRoutes(app);
  const parsed = parseRoutes(rawRoutes, caseSensitive);

  doc.paths = doc.paths ?? {};
  for (const [p, methods] of Object.entries(parsed.paths)) {
    if (!doc.paths[p]) doc.paths[p] = methods;
    else Object.assign(doc.paths[p], methods);
  }
}

/**
 * Inserts or updates a parameter in the parameters list by name and location.
 */
function upsertParameter(parameters: SwaggerParameter[], param: SwaggerParameter) {
  const idx = parameters.findIndex((p) => p.name === param.name && p.in === param.in);
  if (idx !== -1) {
    parameters[idx] = { ...parameters[idx], ...param };
  } else {
    parameters.push(param);
  }
}

/**
 * Parses and adds query, path, header, or cookie parameters from a helper source.
 */
function addCustomParams(
  parameters: SwaggerParameter[],
  openApiIn: string,
  sourceData?: Record<
    string,
    | {
        type?: string;
        required?: boolean;
        description?: string;
        schema?: { type?: string; [key: string]: unknown };
      }
    | string
  >,
) {
  if (!sourceData) return;
  for (const [name, val] of Object.entries(sourceData)) {
    const item: SwaggerParameter = {
      name,
      in: openApiIn,
      required: openApiIn === 'path',
      schema: { type: 'string' },
    };
    if (typeof val === 'string') {
      item.description = val;
    } else if (val && typeof val === 'object') {
      if (val.type) {
        item.schema = { ...item.schema, type: val.type };
      }
      if (val.required !== undefined) item.required = val.required;
      if (val.description) item.description = val.description;
      if (val.schema) {
        item.schema = { ...item.schema, ...val.schema };
      }
    }
    upsertParameter(parameters, item);
  }
}

/**
 * Merges parameter definitions from custom routes, helpers, and path auto-detection.
 */
function mergeRouteParameters(
  existingParams: SwaggerParameter[] | undefined,
  route: SwaggerRouteDefinition,
  normalizedPath: string,
): SwaggerParameter[] {
  const parameters: SwaggerParameter[] = [];

  if (Array.isArray(existingParams)) {
    parameters.push(...existingParams);
  }

  if (route.parameters) {
    for (const p of route.parameters) {
      if (p.name) {
        upsertParameter(parameters, {
          name: p.name,
          in: p.in || 'query',
          required: p.required,
          description: p.description,
          schema: p.schema,
          ...p,
        });
      }
    }
  }

  addCustomParams(parameters, 'path', route.params);
  addCustomParams(parameters, 'query', route.query);
  addCustomParams(parameters, 'header', route.headers);
  addCustomParams(parameters, 'cookie', route.cookies);

  // Auto-detect path parameters from the normalized path
  const autoParams = autoDetectPathParameters(normalizedPath);
  for (const param of autoParams) {
    const alreadyDefined = parameters.some((p) => p.name === param.name && p.in === 'path');
    if (!alreadyDefined) {
      parameters.push(param);
    }
  }

  return parameters;
}

/**
 * Merges requestBody and responses for a custom route.
 */
function mergeRequestBodyAndResponses(
  methodObj: Record<string, unknown>,
  route: SwaggerRouteDefinition,
) {
  if (route?.body) {
    methodObj.requestBody = {
      content: { 'application/json': { schema: route.body } },
    };
  }
  if (route?.responses) {
    methodObj.responses = Object.assign(methodObj.responses || {}, route.responses);
  }
}

const buildMethodObject = (pathItem: Record<string, unknown>, route: SwaggerRouteDefinition) => {
  return {
    ...(pathItem[route.method] ?? {}),
    summary: route?.description?.summary,
    description: route?.description?.text,
    tags: route?.tags ?? (route?.tag ? [route.tag] : undefined),
    deprecated: route?.deprecated,
    security: route?.security,
  };
};

/**
 * Merges manual SwaggerRoute definitions from SwaggerRouteStore into the Swagger document.
 *
 * @param {SwaggerDocument} doc - The Swagger/OpenAPI document to merge paths into.
 * @param {boolean} caseSensitive - Whether route path matching should be case-sensitive.
 * @returns {void}
 */
export function mergeManualRoutes(doc: SwaggerDocument, caseSensitive: boolean) {
  const customRoutes = SwaggerRouteStore.getRouteList();
  for (const route of customRoutes) {
    const rawPath = caseSensitive ? route?.path : route?.path?.toLowerCase();
    const normalizedPath = getCleanBasePath(normalizePath(rawPath)) || '/';

    doc.paths = doc.paths ?? {};
    if (!doc.paths[normalizedPath]) {
      doc.paths[normalizedPath] = {};
    }

    const pathItem = doc.paths[normalizedPath] as Record<string, unknown>;
    pathItem[route.method] = buildMethodObject(pathItem, route);

    const existingParams = (pathItem[route.method] as Record<string, unknown>)?.parameters as
      | SwaggerParameter[]
      | undefined;

    const parameters = mergeRouteParameters(existingParams, route, normalizedPath);

    if (parameters.length > 0) {
      const methodObj = pathItem[route.method] as Record<string, unknown>;
      methodObj.parameters = [...parameters];
    }

    const methodObj = pathItem[route.method] as Record<string, unknown>;
    mergeRequestBodyAndResponses(methodObj, route);
  }
}

/**
 * Injects security schemes config component if configured.
 *
 * @param {SwaggerDocument} doc - The Swagger/OpenAPI document to inject security schemes into.
 * @param {Record<string, SwaggerSecurityScheme>} [security] - Optional security schemes config component.
 * @returns {void}
 */
export function injectSecuritySchemes(
  doc: SwaggerDocument,
  security?: Record<string, SwaggerSecurityScheme>,
) {
  if (security) {
    doc.components = doc?.components || {};
    doc.components.securitySchemes = {
      ...(doc.components?.securitySchemes || {}),
      ...security,
    };
  }
}
