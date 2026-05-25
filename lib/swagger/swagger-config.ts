import path from 'path';
import fs from 'fs';
import { SwaggerOptions } from 'swagger-ui-express';
import pkg, { getInitOutputFile } from './utils/package-json-helper';

// ---------------------------------------------------------------------------
//  Interfaces
// ---------------------------------------------------------------------------

export interface SwaggerInfoConfig {
  title?: string;
  description?: string;
  version?: string;
  contact?: { name?: string; url?: string; email?: string };
  license?: { name?: string; url?: string };
}

export interface SwaggerServerConfig {
  url: string;
  description?: string;
}

/**
 * All configuration options for swagger-express-easy.
 */
export interface SwaggerConfigOptions {
  /** Output file name (default: 'swagger-output.json') */
  outputFile?: string;
  /** Directory for the output file (default: cwd) */
  outputDir?: string;
  /** Files / entry-points to scan for routes */
  endpointsRoutes?: string[];
  /** Base path for multi-instance isolation */
  basePath?: string;
  /** OpenAPI version string (default: '3.0.3') */
  openapi?: string;
  /** API info block */
  info?: SwaggerInfoConfig;
  /** Servers list */
  servers?: SwaggerServerConfig[];
  /**
   * Add Bearer JWT auth to the document.
   * @default false
   */
  bearerAuth?: boolean | { name?: string; description?: string };
  /**
   * Add API Key auth to the document.
   * @default false
   */
  apiKeyAuth?: boolean | { name: string; in?: 'header' | 'query' | 'cookie' };
  /**
   * Global case-sensitive path matching when applying manual routes.
   * @default false
   */
  caseSensitive?: boolean;
  /** Extra security-scheme definitions */
  securityDefinitions?: SwaggerOptions;
  /** Global security requirements */
  security?: Array<Record<string, string[]>>;
  /** Raw extra fields merged into the document root */
  raw?: SwaggerOptions;
  /** Explicitly define tags */
  tags?: Array<{ name: string; description?: string }>;
  /** Define the order of tags in the UI */
  tagsOrder?: string[];
  consumes?: string[];
  produces?: string[];
  definitions?: SwaggerOptions;
  /** Log warnings when routes fail to map */
  debug?: boolean;
}

/** Fully resolved config returned by buildSwaggerConfig */
export interface ResolvedSwaggerConfig extends SwaggerConfigOptions {
  outputFile: string;
  endpointsRoutes: string[];
  basePath: string;
  document: Record<string, any>;
  debug: boolean;
}

/**
 * Merges user-supplied options with sensible defaults.
 */
export function buildSwaggerConfig(options: SwaggerConfigOptions = {}): ResolvedSwaggerConfig {
  const info = {
    title: options?.info?.title ?? `${pkg?.name ?? 'My API'} — API Docs`,
    description: options?.info?.description ?? pkg?.description ?? 'Auto-generated Swagger docs',
    version: options?.info?.version ?? pkg?.version ?? '1.0.0',
    ...(options?.info?.contact ? { contact: options?.info?.contact } : {}),
    ...(options?.info?.license ? { license: options?.info?.license } : {}),
  };

  // Provide a default empty server url so swagger-autogen doesn't default to localhost:3000
  const servers: SwaggerServerConfig[] = options?.servers ?? [{ url: '' }];

  // Security schemes
  const securitySchemes: Record<string, any> = {
    ...(options?.securityDefinitions ?? {}),
  };
  if (options?.bearerAuth) {
    const bearerConfig = typeof options.bearerAuth === 'object' ? options.bearerAuth : {};
    securitySchemes.bearerAuth = {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      ...(bearerConfig.description ? { description: bearerConfig.description } : {}),
    };
  }
  if (options?.apiKeyAuth) {
    const apiConfig =
      typeof options.apiKeyAuth === 'object'
        ? options.apiKeyAuth
        : { name: 'api_key', in: 'header' };
    securitySchemes.apiKeyAuth = {
      type: 'apiKey',
      name: apiConfig.name ?? 'api_key',
      in: apiConfig.in ?? 'header',
    };
  }

  const globalSecurity: Array<Record<string, string[]>> = options.security ?? [
    ...(options?.bearerAuth ? [{ bearerAuth: [] }] : []),
    ...(options?.apiKeyAuth ? [{ apiKeyAuth: [] }] : []),
  ];

  const document: Record<string, any> = {
    openapi: options?.openapi ?? '3.0.3',
    info,
    servers,
    components: {
      schemas: {},
      securitySchemes,
    },
    security: globalSecurity,
    ...(options?.tags ? { tags: options?.tags } : {}),
    ...(options?.consumes ? { consumes: options?.consumes } : {}),
    ...(options?.produces ? { produces: options?.produces } : {}),
    ...(options?.definitions ? { definitions: options?.definitions } : {}),
    ...(options?.raw ?? {}),
  };

  const finalOutputFile = path.resolve(
    options?.outputDir ?? process.cwd(),
    options?.outputFile ?? getInitOutputFile(),
  );

  function getAllSrcFiles(dir: string, fileList: string[] = []): string[] {
    if (!fs.existsSync(dir)) return fileList;
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const filePath = path.join(dir, file);
      if (fs.statSync(filePath).isDirectory()) {
        getAllSrcFiles(filePath, fileList);
      } else if (file.endsWith('.ts') || file.endsWith('.js')) {
        fileList.push(filePath);
      }
    }
    return fileList;
  }

  let routesToScan = (options?.endpointsRoutes ?? []).filter((f) =>
    fs.existsSync(path.resolve(process.cwd(), f)),
  );

  if (routesToScan.length === 0) {
    const commonEntrypoints = [
      './src/app.ts',
      './src/index.ts',
      './src/server.ts',
      './src/main.ts',
      './src/app.js',
      './src/index.js',
      './src/server.js',
      './src/main.js',
    ] as const;
    const entrypoint = commonEntrypoints.find((f) => fs.existsSync(path.resolve(process.cwd(), f)));
    if (entrypoint) {
      routesToScan = [entrypoint];
    } else {
      const srcDir = path.resolve(process.cwd(), 'src');
      if (fs.existsSync(srcDir)) {
        routesToScan = getAllSrcFiles(srcDir).map(
          (p) => './' + path.relative(process.cwd(), p).replace(/\\/g, '/'),
        );
      } else {
        routesToScan = ['./src/app.ts']; // fallback
      }
    }
  }

  return {
    ...options,
    outputFile: finalOutputFile,
    endpointsRoutes: routesToScan,
    basePath: options?.basePath ?? '/',
    document,
    debug: options?.debug ?? process.env.NODE_ENV !== 'production',
  };
}

/** Default config (used by the start script) */
export const SWAGGER_CONFIG = buildSwaggerConfig();
