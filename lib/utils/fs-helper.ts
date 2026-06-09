import fs from 'fs';
import path from 'path';

/**
 * Checks if a file or directory exists.
 *
 * @param {string} filePath - Absolute path to check.
 * @returns {boolean} True if it exists, false otherwise.
 */
export function fileExists(filePath: string): boolean {
  return fs.existsSync(filePath);
}

/**
 * Ensures that the directory for the given file path exists.
 * Creates it recursively if missing.
 *
 * @param {string} filePath - Absolute path to the target file.
 * @returns {void}
 */
export function ensureDirForFile(filePath: string): void {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * Writes an object as pretty-printed JSON to disk, ensuring the directory exists.
 *
 * @param {string} filePath - Absolute path to the target file.
 * @param {unknown} data - Serializable data to be saved.
 * @returns {void}
 * @example
 * writeJsonFile('/tmp/swagger.json', { openapi: '3.0.0' });
 */
export function writeJsonFile(filePath: string, data: unknown): void {
  ensureDirForFile(filePath);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

/**
 * Reads a JSON file and parses its contents.
 * Returns `undefined` if the file does not exist or parsing fails.
 *
 * @template T - The expected return type after parsing.
 * @param {string} filePath - Absolute path to the JSON file.
 * @returns {T | undefined} Parsed data, or `undefined` on failure.
 * @example
 * const config = readJsonFile<SwaggerDocument>('./swagger.json');
 */
export function readJsonFile<T = unknown>(filePath: string): T | undefined {
  if (!fs.existsSync(filePath)) return undefined;
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw) as T;
  } catch {
    return undefined;
  }
}
