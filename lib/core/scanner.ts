import type { Express, Router } from 'express';
import type { ParsedRoute, RouteMeta } from '../types/express';

/**
 * Recursively scans an Express app or router to extract all registered routes.
 *
 * @param {Express | Router | Record<string, unknown>} appOrRouter - The Express app or a sub-router.
 * @returns {ParsedRoute[]} Flat array of every route found (including nested routers).
 * @example
 * const routes = scanRoutes(app);
 * // [{ path: '/users', method: 'get', handler: fn, middlewares: [], meta: {} }, ...]
 */
export function scanRoutes(appOrRouter: Express | Router | Record<string, unknown>): ParsedRoute[] {
  const routes: ParsedRoute[] = [];
  const stack = appOrRouter._router?.stack || appOrRouter.stack || [];

  for (const layer of stack) {
    if (layer.route) {
      // It's a route directly attached
      const path = layer.route.path;
      const methods = Object.keys(layer.route.methods).filter((m) => layer.route.methods[m]);

      const handlers = layer.route.stack.map(
        (s: Record<string, unknown>) => s.handle as (...args: unknown[]) => unknown,
      );
      const handler = handlers[handlers.length - 1];
      const middlewares = handlers.slice(0, handlers.length - 1);

      // Determine case sensitivity from the router that owns it if possible
      const meta: RouteMeta = {};

      for (const method of methods) {
        routes.push({
          path: typeof path === 'string' ? path : path.toString(),
          method: method.toLowerCase(),
          middlewares,
          handler,
          meta,
        });
      }
    } else if (layer.name === 'router' && layer.handle?.stack) {
      // It's a nested router
      const nestedRoutes = scanRoutes(layer.handle);
      const basePath = layer.regexp?.source ? extractPathFromRegexp(layer.regexp.source) : '';

      // router specific caseSensitivity
      const isCaseSensitive = layer.handle.caseSensitive;

      for (const r of nestedRoutes) {
        routes.push({
          ...r,
          path: joinPaths(basePath, r.path),
          meta: {
            ...r.meta,
            caseSensitive: isCaseSensitive !== undefined ? isCaseSensitive : r.meta.caseSensitive,
          },
        });
      }
    }
  }

  return routes;
}

function extractPathFromRegexp(source: string): string {
  if (source === '^\\/?(?=\\/|$)') return '';
  const match = source.match(/^\^\\\/([^?]+)\\\/\?\(\?=\\\/\|\$\)/);
  if (match) {
    return '/' + match[1].replace(/\\\//g, '/');
  }
  return '';
}

function joinPaths(base: string, sub: string): string {
  const b = base.endsWith('/') ? base.slice(0, -1) : base;
  const s = sub.startsWith('/') ? sub : `/${sub}`;
  return b + s;
}
