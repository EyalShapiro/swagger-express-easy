export interface SwaggerSecurityScheme {
  type: 'apiKey' | 'http';
  name?: string;
  in?: 'header' | 'query' | 'cookie';
  scheme?: 'bearer' | string;
  bearerFormat?: string;
}

export interface SwaggerParameter {
  name: string;
  in: 'path' | 'query' | 'header' | 'cookie' | 'formData' | string;
  required?: boolean;
  description?: string;
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

export interface SwaggerPathItem {
  get?: SwaggerOperation;
  post?: SwaggerOperation;
  put?: SwaggerOperation;
  delete?: SwaggerOperation;
  patch?: SwaggerOperation;
  options?: SwaggerOperation;
  head?: SwaggerOperation;
}

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
