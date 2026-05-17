import path from 'path';
import fs from 'fs';
import fsPromises from 'fs/promises';

import { JsonObject } from 'swagger-ui-express';

import { SWAGGER_CONFIG } from '../swagger.config';
export const getAddrFormatToLocal = (address: string) => (address === '::' ? 'localhost' : address);

/**
 * Lightweight JSON parser — inline so the library has no external deps.
 * Returns `fallbackValue` (default `{}`) if input is falsy or invalid JSON.
 */
function parseJson<T extends object | unknown[]>(
  jsonString: string | null | undefined,
  fallbackValue: T = {} as T,
): T {
  try {
    if (!jsonString) return fallbackValue;
    return JSON.parse(jsonString);
  } catch {
    return fallbackValue;
  }
}

/**
 * Returns the absolute path to the generated Swagger/OpenAPI JSON file.
 * We use a function to avoid top-level circular dependency issues with SWAGGER_CONFIG.
 */
export function getSwaggerFilePath(): string {
  return path.resolve(process.cwd(), SWAGGER_CONFIG?.outputFile || 'swagger-output.json');
}



/**
 * Reads and safely parses the Swagger/OpenAPI JSON file from disk
 *
 * @param {string} filePath  - Optional custom path (defaults to config-defined file)
 * @returns {Promise<JsonObject>} Parsed Swagger document as JsonObject. Returns {} if file doesn't exist.
 */
export async function readSwaggerFile(
  filePath: string = getSwaggerFilePath(),
): Promise<JsonObject> {
  try {
    if (!fs.existsSync(filePath)) {
      // If file doesn't exist, return empty object instead of throwing
      return {} as JsonObject;
    }
    const fileData = await fsPromises.readFile(filePath, { encoding: 'utf-8' });
    const jsonSD = parseJson(fileData);
    return jsonSD as JsonObject;
  } catch (error) {
    // Only log if the file actually exists but failed to read/parse
    if (fs.existsSync(filePath)) {
      console.error('Error reading Swagger file:', error);
    }
    return {} as JsonObject;
  }
}

/**
 * Updates (overwrites) the Swagger JSON file on disk
 * Synchronously writes – suitable for startup/build time
 *
 * @param {JsonObject} swaggerDocument - Complete OpenAPI object to save
 * @param {string} filePath=getSwaggerFilePath() - Optional custom path
 */
export async function updateSwaggerFile(
  swaggerDocument: JsonObject,
  filePath: string = getSwaggerFilePath(),
) {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      await fsPromises.mkdir(dir, { recursive: true });
    }

    // Ensure the document has a valid OpenAPI/Swagger version if missing
    if (!swaggerDocument.openapi && !swaggerDocument.swagger) {
      swaggerDocument.openapi = '3.0.3';
    }

    await fsPromises.writeFile(filePath, JSON.stringify(swaggerDocument, null, 2), 'utf-8');
    console.info(`Swagger file updated: ${filePath}`);
  } catch (error) {
    console.error('Error updating Swagger file:', error);
    throw error;
  }
}

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
