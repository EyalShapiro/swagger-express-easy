/**
 * Metadata attached to a scanned route layer.
 * @property {boolean} [caseSensitive] - Whether this route uses case-sensitive matching.
 */
export interface RouteMeta {
  caseSensitive?: boolean;
}

/**
 * Represents a single route extracted from the Express router stack.
 *
 * @property {string} path - The URL path pattern (e.g. `'/users/:id'`).
 * @property {string} method - HTTP method in lowercase (e.g. `'get'`).
 * @property {Function[]} middlewares - Middleware functions preceding the handler.
 * @property {Function} handler - The terminal request handler.
 * @property {RouteMeta} meta - Additional metadata (case sensitivity, etc.).
 */
export interface ParsedRoute {
  path: string;
  method: string;
  middlewares: ((...args: unknown[]) => unknown)[];
  handler: (...args: unknown[]) => unknown;
  meta: RouteMeta;
}
