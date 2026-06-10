import type { HTTPMethod, ParametersType } from '../swagger/routeStore';

export interface SwaggerSecurityScheme {
  type: 'apiKey' | 'http';
  name?: string;
  in?: 'header' | 'query' | 'cookie';
  scheme?: 'bearer' | (string & {});
  bearerFormat?: string;
}

export interface SwaggerParameter
  extends
    Required<Pick<ParametersType, 'name' | 'in'>>,
    Pick<ParametersType, 'description' | 'required'> {
  schema?: {
    type?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface SwaggerOperation {
  summary?: string;
  description?: string;
  tags?: string[];
  consumes?: string[];
  produces?: string[];
  parameters?: SwaggerParameter[];
  requestBody?: unknown;
  responses?: Record<string, unknown>;
  deprecated?: boolean;
  security?: Record<string, string[]>[];
}

export type SwaggerPathItem = Partial<
  Record<Exclude<HTTPMethod, 'connect' | 'trace'>, SwaggerOperation>
>;
export interface SwaggerDocument {
  openapi?: string;
  swagger?: string;
  info?: {
    title: string;
    version: string;
    description?: string;
  };
  servers?: { url: string; description?: string }[];
  host?: string;
  basePath?: string;
  paths?: Record<string, SwaggerPathItem>;
  components?: {
    schemas?: Record<string, unknown>;
    securitySchemes?: Record<string, SwaggerSecurityScheme>;
  };
  tags?: { name: string; description?: string }[];
}
