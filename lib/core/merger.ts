import type { Express, Request } from 'express';
import type { SwaggerDocument } from '../types/swagger';
import { scanRoutes } from './scanner';
import { parseRoutes } from './parser';
import { SwaggerRouteStore } from '../swagger/routeStore';
import { getCleanBasePath, normalizePath } from '../utils/path';

/**
 * Scans the live Express application and merges its parsed routes into the Swagger document.
 *
 * @param {SwaggerDocument} doc - The Swagger/OpenAPI document to merge paths into.
 * @param {Express} app - The Express application instance.
 * @param {boolean} caseSensitive - Whether route path matching should be case-sensitive.
 * @returns {void}
 */
export function mergeDynamicRoutes(
  doc: SwaggerDocument,
  app: Express,
  caseSensitive: boolean,
): void {
  const rawRoutes = scanRoutes(app);
  const parsed = parseRoutes(rawRoutes, caseSensitive);

  doc.paths = doc.paths ?? {};
  for (const [p, methods] of Object.entries(parsed.paths)) {
    if (!doc.paths[p]) doc.paths[p] = methods;
    else Object.assign(doc.paths[p], methods);
  }
}

/**
 * Merges manual SwaggerRoute definitions from SwaggerRouteStore into the Swagger document.
 *
 * @param {SwaggerDocument} doc - The Swagger/OpenAPI document to merge paths into.
 * @param {boolean} caseSensitive - Whether route path matching should be case-sensitive.
 * @returns {void}
 */
export function mergeManualRoutes(doc: SwaggerDocument, caseSensitive: boolean): void {
  const customRoutes = SwaggerRouteStore.getRouteList();
  for (const route of customRoutes) {
    const rawPath = caseSensitive ? route?.path : route?.path?.toLowerCase();
    const normalizedPath = getCleanBasePath(normalizePath(rawPath)) || '/';

    doc.paths = doc.paths ?? {};
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

    const existingParams = (pathItem[route.method] as Record<string, unknown>)?.parameters;
    const parameters: any[] = [];

    if (Array.isArray(existingParams)) {
      parameters.push(...existingParams);
    }

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
          required: source === 'path',
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
}

/**
 * Injects security schemes config component if configured.
 *
 * @param {SwaggerDocument} doc - The Swagger/OpenAPI document to inject security schemes into.
 * @param {Record<string, any>} [security] - Optional security schemes config component.
 * @returns {void}
 */
export function injectSecuritySchemes(doc: SwaggerDocument, security?: Record<string, any>): void {
  if (security) {
    doc.components = doc?.components || {};
    doc.components.securitySchemes = {
      ...(doc.components?.securitySchemes || {}),
      ...security,
    };
  }
}
