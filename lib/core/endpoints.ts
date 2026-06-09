import path from 'path';
import { fileExists } from '../utils/fs-helper';

const warnedFiles = new Set<string>();

/**
 * Checks if a pattern is a glob pattern.
 *
 * @param {string} pattern - The file path pattern to check.
 * @returns {boolean} True if the pattern is a glob pattern.
 */
export function isGlobPattern(pattern: string): boolean {
  return /[*?{}[\]]/.test(pattern);
}

/**
 * Logs a warning once for a missing file.
 *
 * @param {string} filePath - Absolute path to the missing file.
 * @returns {void}
 */
export function warnMissingFileOnce(filePath: string): void {
  if (!warnedFiles.has(filePath)) {
    warnedFiles.add(filePath);
    console.warn(
      `\x1b[33m[swagger-express-easy] Warning: Route file/configuration not found at "${filePath}". Ignoring.\x1b[0m`,
    );
  }
}

/**
 * Resolves a list of file paths/patterns, filtering out non-existent concrete files.
 *
 * @param {string[]} rawEndpoints - Array of raw endpoint paths or globs.
 * @returns {string[]} Resolved existing file paths and glob patterns.
 */
export function resolveEndpoints(rawEndpoints: string[]): string[] {
  const endpoints: string[] = [];
  for (const filePattern of rawEndpoints) {
    const resolvedPath = path.resolve(process.cwd(), filePattern);
    if (isGlobPattern(filePattern)) {
      endpoints.push(resolvedPath);
    } else if (fileExists(resolvedPath)) {
      endpoints.push(resolvedPath);
    } else {
      warnMissingFileOnce(resolvedPath);
    }
  }
  return endpoints;
}
