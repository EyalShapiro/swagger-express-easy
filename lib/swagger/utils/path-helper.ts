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
 */
export const getAddrFormatToLocal = (address: string) => (address === '::' ? 'localhost' : address);
