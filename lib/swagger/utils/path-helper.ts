/**
 * Standardizes a path string to ensure it starts with a '/' and has no trailing '/'.
 * @param {string} path The path string to normalize.
 * @returns {string} The normalized path string.
 */
export function normalizePath(path: string): string {
  if (!path) return '/';
  const withLeading = path.startsWith('/') ? path : `/${path}`;
  if (withLeading.length > 1 && withLeading.endsWith('/')) {
    return withLeading.slice(0, -1);
  }
  return withLeading;
}
/**
 * Normalizes a network address format (e.g. :: to localhost).
 * @param {string|undefined} address
 * @returns {string}
 */

export function getAddrFormatToLocal(address: string | undefined) {
  if (!address) return 'localhost';
  return address === '::' ? 'localhost' : address;
}

/**
 * Converts an Express route path parameter syntax (e.g. :id) to OpenAPI format (e.g. {id}).
 * @param {string|undefined} path
 * @returns {string}
 */
export function convertExpressToOpenApiPath(path: string | undefined): string {
  if (!path) return '';
  return path.replace(/:([a-zA-Z0-9_]+)/g, '{$1}');
}

/**
 * Normalizes a base path, ensuring it starts with '/' and doesn't end with '/'.
 * @param {string|undefined} basePath
 * @returns {string}
 */
export function normalizeBasePath(basePath: string): string {
  if (!basePath || basePath === '/') return '/';
  const leading = basePath.startsWith('/') ? basePath : `/${basePath}`;
  return leading.endsWith('/') ? leading.slice(0, -1) : leading;
}

/**
 * Prefixes a path with a base path correctly, removing duplicate slashes.
 * @param {string|undefined} pathStr
 * @param {string|undefined} basePath
 * @returns {string}
 */
export function prefixPathWithBase(pathStr: string, basePath: string): string {
  const normBase = normalizeBasePath(basePath);
  if (normBase === '/') return normalizePath(pathStr);
  const normPath = normalizePath(pathStr);
  return `${normBase}${normPath}`.replace(/\/+/g, '/');
}
