import path from 'path';
import { fileExists } from '../utils/fs-helper';
import { logErrorWithSuggestion } from '../utils/logger';

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
export function warnMissingFileOnce(filePath: string) {
  if (!warnedFiles.has(filePath)) {
    warnedFiles.add(filePath);
    logErrorWithSuggestion(
      'Route configuration not found',
      filePath,
      'Verify the file exists and the path is correct in your endpointsRoutes configuration.',
    );
  }
}

/**
 * Resolves a list of file paths/patterns, filtering out non-existent concrete files.
 *
 * @param {string[]} rawEndpoints - Array of raw endpoint paths or globs.
 * @param {boolean} [isDefaultList=false] - Whether these are the default scanned paths.
 * @returns {string[]} Resolved existing file paths and glob patterns.
 */
export function resolveEndpoints(rawEndpoints: string[], isDefaultList = false): string[] {
  const endpoints: string[] = [];
  for (const filePattern of rawEndpoints) {
    const resolvedPath = path.resolve(process.cwd(), filePattern);
    if (isGlobPattern(filePattern)) {
      endpoints.push(resolvedPath);
    } else if (fileExists(resolvedPath)) {
      endpoints.push(resolvedPath);
    } else if (!isDefaultList) {
      warnMissingFileOnce(resolvedPath);
    }
  }
  return endpoints;
}
