import path from 'path';
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

  const components: SwaggerOptions['components'] =
    options.bearerAuth !== false
      ? {
          securitySchemes: {
            bearerAuth: {
              type: 'http',
              scheme: 'bearer',
              bearerFormat: 'JWT',
              description: 'Enter JWT token',
            },
          },
        }
      : undefined;

  const document: SwaggerOptions = {
    openapi: options.openapi ?? '3.0.3',
    info,
    servers,
    ...(components ? { components, security: [{ bearerAuth: [] }] } : {}),
    schemes: ['http', 'https'],
    host: host,
    basePath: options.basePath ?? '/',
    ...options.raw,
  };

  const finalOutputFile = options.outputDir
    ? path.join(options.outputDir, options.outputFile ?? 'swagger-output.json')
    : (options.outputFile ?? 'tools/swagger-output.json');

  return {
    port: options.port,
    host,
    outputFile: finalOutputFile,
    endpointsRoutes: options.endpointsRoutes ?? ['./src/*.ts,.js'],
    document,
  };
}

/**
 * Default configuration instance built with zero options.
 * Uses smart defaults from env and package.json.
 */
export const SWAGGER_CONFIG = buildSwaggerConfig();
