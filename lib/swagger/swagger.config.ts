import path from 'path';
import fs from 'fs';
import { SwaggerOptions } from 'swagger-ui-express';
import _pkg from './utils/_packageJsonData';

/**
 * Configuration for the OpenAPI 'info' block.
 * This information is displayed at the very top of the Swagger UI.
 */
export interface SwaggerInfoConfig {
  /** The title of the API. Defaults to package.json name. */
  title?: string;
  /** A brief description of the API. Defaults to package.json description. */
  description?: string;
  /** The version of the API. Defaults to package.json version. */
  version?: string;
  /** Contact information for the API developers. */
  contact?: { name?: string; url?: string; email?: string };
  /** License information for the API. */
  license?: { name?: string; url?: string };
}

/**
 * Configuration for an OpenAPI server entry.
 */
export interface SwaggerServerConfig {
  /** The full URL of the server (e.g., 'http://localhost:3000'). */
  url: string;
  /** A short description of the environment (e.g., 'Local Dev'). */
  description?: string;
}

/**
 * Global configuration options for the swagger-express-easy library.
 */
export interface SwaggerConfigOptions {
  /** The port number the server is running on. */
  port?: number | string;
  /** The host name the server is running on (e.g., 'localhost', 'api.example.com'). */
  host?: string;
  /** The filename for the generated Swagger JSON file. @default 'swagger-output.json' */
  outputFile?: string;
  /** The directory where the Swagger JSON file should be saved. @default process.cwd() */
  outputDir?: string;
  /** Glob patterns of files to scan for Express routes. */
  endpointsRoutes?: string[];
  /** Metadata for the OpenAPI 'info' object. */
  info?: SwaggerInfoConfig;
  /** A list of server environments (Dev, Staging, Prod). */
  servers?: SwaggerServerConfig[];
  /** The base path for all API routes. @default '/' */
  basePath?: string;
  /** The OpenAPI specification version to use. @default '3.0.3' */
  openapi?: string;
  /** Whether to automatically include JWT Bearer Auth in the specification. @default true */
  bearerAuth?: boolean;
  /** Security definitions (Swagger 2.0) or Security Schemes (OpenAPI 3.0) */
  securityDefinitions?: Record<string, any>;
  /** Global security requirements applied to all routes */
  security?: Array<Record<string, string[]>>;
  /** Global model definitions */
  definitions?: Record<string, any>;
  /** Global tags with descriptions */
  tags?: Array<{ name: string; description?: string }>;
  /** Global media types the API consumes */
  consumes?: string[];
  /** Global media types the API produces */
  produces?: string[];
  /** Raw access to the underlying Swagger configuration object. */
  raw?: SwaggerOptions;
}

/**
 * Merges user-supplied options with sensible defaults derived from
 * environment variables and the project's package.json.
 *
 * @param {SwaggerConfigOptions} [options={}] - User configuration options.
 * @returns The fully resolved configuration object.
 */
export function buildSwaggerConfig(options: SwaggerConfigOptions = {}) {
  const host = options.host || (options.port ? `localhost:${options.port}` : 'localhost');

  const info: SwaggerOptions['info'] = {
    title: options.info?.title ?? `${_pkg?.name ?? 'My API'} — API Documentation`,
    description:
      options.info?.description ?? _pkg?.description ?? 'Auto-generated Swagger documentation',
    version: options.info?.version ?? _pkg?.version ?? '1.0.0',
    ...(options.info?.contact ? { contact: options.info.contact } : {}),
    ...(options.info?.license ? { license: options.info.license } : {}),
  };

  const servers: SwaggerServerConfig[] = options.servers ?? [
    { description: 'Local development', url: `http://${host}` },
  ];

  const components: SwaggerOptions['components'] = {
    securitySchemes: {
      ...(options.bearerAuth !== false
        ? {
            bearerAuth: {
              type: 'http',
              scheme: 'bearer',
              bearerFormat: 'JWT',
              description: 'Enter JWT token',
            },
          }
        : {}),
      ...(options.securityDefinitions || {}),
    },
  };

  const document: SwaggerOptions = {
    openapi: options?.openapi ?? '3.0.3',
    info,
    servers,
    components,
    security: options?.security ?? (options.bearerAuth !== false ? [{ bearerAuth: [] }] : []),
    definitions: options?.definitions,
    tags: options?.tags,
    consumes: options?.consumes,
    produces: options?.produces,
    schemes: ['http', 'https'],
    host: host,
    basePath: options?.basePath ?? '/',
    ...options.raw,
  };

  const finalOutputFile = path.join(
    options?.outputDir ?? process.cwd() ?? __dirname ?? '',
    options?.outputFile ?? 'swagger-output.json',
  );

  // Default entry points to scan if none provided
  const defaultEntries = ['./src/app.ts', './src/index.ts', './src/server.ts', './src/main.ts'];
  const existingEntries = defaultEntries.filter((f) =>
    fs.existsSync(path.resolve(process.cwd(), f)),
  );

  return {
    port: options.port,
    host,
    outputFile: finalOutputFile,
    endpointsRoutes: (
      options?.endpointsRoutes ?? (existingEntries.length > 0 ? existingEntries : ['./src/app.ts'])
    ).filter((f) => fs.existsSync(path.resolve(process.cwd(), f))),
    document,
  };
}

/**
 * Default configuration instance built with zero options.
 * Uses smart defaults from env and package.json.
 */
export const SWAGGER_CONFIG = buildSwaggerConfig();
