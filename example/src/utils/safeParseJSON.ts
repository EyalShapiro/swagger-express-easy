import { IS_PROD } from '../config';

/**
 * Safely parses a JSON string into a value of type `T`.
 *
 * - If the input string is falsy, it returns the provided `fallbackValue`.
 * - On parsing failure, it logs a warning in non-production environments
 *   and returns the provided `fallbackValue`.
 *
 * @template T - The expected return type. Typically an `object` or `array`.
 * @param {string | null | undefined} jsonString - The JSON string to parse.
 * @param {T} [fallbackValue={}] - The fallback value if parsing fails.
 * @default {}
 * @returns {T} The parsed value if successful, otherwise `fallbackValue`.
 */
export function parseJson<T extends object | unknown[]>(
  jsonString: string | null | undefined,
  fallbackValue: T = {} as T,
): T {
  try {
    if (!jsonString) return fallbackValue;
    return JSON.parse(jsonString);
  } catch (error) {
    if (!IS_PROD) console.warn('Failed to parse JSON string:', error);
    return fallbackValue;
  }
}
