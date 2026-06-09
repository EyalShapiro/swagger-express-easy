import type { SwaggerOptions, SwaggerUiOptions } from 'swagger-ui-express';
import type { SwaggerSecurityScheme } from './swagger';

export interface SwaggerConfigOptions {
  basePath?: string;
  outputFile?: string;
  outputDir?: string;
  endpointsRoutes?: string[];
  document?: SwaggerOptions;
  caseSensitive?: boolean;
  debug?: boolean;
  bearerAuth?: boolean | { description?: string };
  apiKeyAuth?: boolean | { name?: string; in?: 'header' | 'query' | 'cookie' };
  security?: Record<string, SwaggerSecurityScheme>;
  tagsOrder?: string[];
}

export interface SwaggerSetupOptions extends SwaggerConfigOptions {
  path?: string;
  swaggerUiOptions?: SwaggerUiOptions;
  watch?: boolean;
}

export interface ResolvedSwaggerConfig extends SwaggerConfigOptions {
  outputFile: string;
  basePath: string;
  tagsOrder: string[];
}
