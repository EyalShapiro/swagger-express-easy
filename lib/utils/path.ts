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
export function extractPathParams(path: string): string[] {
  return [...path.matchAll(/:([A-Za-z0-9_]+)/g)].map((match) => match[1]);
}
/**
 * Safely joins a basePath and a normalized route path.
 *
 * @param {string} base - The base path (e.g. `'/api/v1'`).
 * @param {string} normalized - A normalized path segment (must start with `/` or will be prefixed).
 * @returns {string} The concatenated path.
 * @example
 * joinBasePath('/api/v1', '/users') // → '/api/v1/users'
 */
export function joinBasePath(base: string, normalized: string): string {
  const cleanBase = getCleanBasePath(base);
  const cleanNormalized = normalized.startsWith('/') ? normalized : `/${normalized}`;
  return cleanBase + cleanNormalized;
}
/**
 * Clean path from trailing slash.
 * @param {string|null|undefined} path
 * @returns {string}
 */
export function getCleanBasePath(path: string | null | undefined): string {
  if (!path) return '';
  return path.replace(/\/$/, '');
}

/**
 * Returns a proper local IP if address is `'::'` or `'0.0.0.0'`.
 *
 * @param {string} addr - The raw server address string.
 * @returns {string} `'localhost'` when the address is a wildcard, otherwise the original address.
 * @example
 * getAddrFormatToLocal('::')       // → 'localhost'
 * getAddrFormatToLocal('127.0.0.1') // → '127.0.0.1'
 */
export function getAddrFormatToLocal(addr: string): string {
  if (addr === '::' || addr === '0.0.0.0') {
    return 'localhost';
  }
  return addr;
}
export function toString<T>(path: T): string {
  if (typeof path === 'string') return path;

  return path?.toString() ?? '';
}
export function joinPaths(base: string, sub: string): string {
  const b = base.endsWith('/') ? base.slice(0, -1) : base;
  const s = sub.startsWith('/') ? sub : `/${sub}`;
  return b + s;
}
