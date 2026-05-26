import type { ParsedRoute } from '../types/express';
import type { Express } from 'express';
import { scanRoutes } from './scanner';

/**
 * Caches scanned routes to avoid re-scanning the Express app on every request.
 * @internal
 */
const routeCache = new Map<string, ParsedRoute[]>();

/**
 * Provides cached access to scanned Express routes.
 * Avoids expensive repeated `scanRoutes()` calls on the same base path.
 */
export class RouteBuilder {
  /**
   * Returns all parsed routes for the given `basePath`, scanning only once.
   *
   * @param {Express} app - The Express application instance.
   * @param {string} basePath - The base path key used for caching.
   * @returns {ParsedRoute[]} Flat list of routes extracted from the app.
   */
  static getRoutes(app: Express, basePath: string): ParsedRoute[] {
    const cacheKey = basePath ?? '/';

    if (routeCache.has(cacheKey)) {
      return routeCache.get(cacheKey) ?? [];
    }

    const routes = scanRoutes(app);
    routeCache.set(cacheKey, routes);
    return routes;
  }

  /**
   * Clears the route cache.
   *
   * @param {string} [basePath] - If provided, only that key is removed; otherwise the entire cache is cleared.
   * @returns {void}
   */
  static invalidateCache(basePath?: string): void {
    if (basePath) {
      routeCache.delete(basePath);
    } else {
      routeCache.clear();
    }
  }
}
