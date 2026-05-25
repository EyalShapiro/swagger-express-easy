import { JsonObject } from 'swagger-ui-express';

/**
 * Standard HTTP methods.
 */
export const HTTP_METHODS = [
  'get',
  'post',
  'put',
  'delete',
  'patch',
  'options',
  'head',
  'trace',
  'connect',
] as const;

export type HTTPMethod = (typeof HTTP_METHODS)[number] | (string & {});

export type SchemaType = {
  // https://swagger.io/docs/specification/v3_0/describing-parameters/
  type: string;
} & JsonObject;

export interface ParametersType {
  in?: 'query' | 'header' | 'path' | 'cookie' | 'formData' | (string & {});
  name?: string;
  required?: boolean;
  type?: string;
  items?: { type: string } & JsonObject;
  schema?: SchemaType;
  description?: string;
}

/**
 * Structure of a single Swagger route documentation entry.
 */
export type SwaggerRouteDefinition = {
  method: HTTPMethod;
  path: string;
  description?: { text?: string; summary?: string };
  body?: ({ default?: JsonObject } & JsonObject) | any;
  parameters?: Array<ParametersType & JsonObject>;
  /** Media types the API can consume (e.g. ['multipart/form-data']) */
  consumes?: string[];
  /** Media types the API can produce (e.g. ['application/json']) */
  produces?: string[];
  /** Single tag for this route (convenience) */
  tag?: string;
  /** List of tags for this route */
  tags?: string[];
  /** Expected HTTP responses (status code mapping) */
  responses?: Record<
    number | string,
    { description?: string; schema?: any | SchemaType } & JsonObject
  >;
  /** Mark this route as deprecated in OpenAPI spec */
  deprecated?: boolean;
  /** Override global case-sensitive matching for this specific route */
  caseSensitive?: boolean;
  /** Security requirements for this specific route */
  security?: Array<Record<string, string[]>>;
};
