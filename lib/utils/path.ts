/**
 * Normalizes a route path.
 * Converts Express params (e.g. `/users/:id`) to OpenAPI format (`/users/{id}`)
 * and removes trailing slashes.
 *
 * @param {string} path - Raw Express route path.
 * @returns {string} Normalized OpenAPI path string.
 * @example
 * normalizePath('/users/:id/') // → '/users/{id}'
 */
export function normalizePath(path: string): string {
  if (!path) return '/';
  let normalized = path.replace(/:([a-zA-Z0-9_]+)/g, '{$1}').replace(/\/$/, '');
  if (normalized && !normalized.startsWith('/')) {
    normalized = '/' + normalized;
  }
  return normalized || '/';
}

export function getCleanBasePath(path: string | null | undefined): string {
  if (!path) return '';
  return path.replace(/\/$/, '');
}

/**
 * Ensures the value is returned as a string.
 *
 * @param {T} path - The value to cast or format to a string.
 * @returns {string} The string representation.
 */
export function toString<T>(path: T): string {
  if (typeof path === 'string') return path;

  return path?.toString() ?? '';
}

/**
 * Safely joins a base path and a sub path.
 *
 * @param {string} base - The base path (e.g. `'/api'`).
 * @param {string} sub - The sub path (e.g. `'/users'`).
 * @returns {string} The concatenated path.
 */
export function joinPaths(base: string, sub: string): string {
  const b = base.endsWith('/') ? base.slice(0, -1) : base;
  const s = sub.startsWith('/') ? sub : `/${sub}`;
  return b + s;
}
