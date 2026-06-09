/**
 * Capitalizes the first letter of a string.
 *
 * @param {string} str - Input string.
 * @returns {string} The string with the first character uppercased, or `''` if empty.
 */
export function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Normalizes a string for use as a tag name (lowercased, trimmed).
 *
 * @param {string} str - Raw tag string.
 * @returns {string} Cleaned tag, or `'default'` if input is empty.
 */
export function normalizeTag(str: string): string {
  if (!str) return 'default';
  return str.trim().toLowerCase();
}
