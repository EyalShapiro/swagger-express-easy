import { JsonObject } from 'swagger-ui-express';

/**
 * Swagger route HTTP methods (Express-typed).
 * Extracted from express-serve-static-core to stay framework-consistent.
 */
export type HTTPMethod =
  | 'get'
  | 'post'
  | 'put'
  | 'delete'
  | 'patch'
  | 'options'
  | 'head'
  | 'trace'
  | 'connect'
  | (string & {});
export interface ParametersType {
  in?: 'query' | 'header' | 'path' | 'cookie' | 'formData' | (string & {});
  name?: string;
  required?: boolean;
  schema?: { type: string } & JsonObject; //https://swagger.io/docs/specification/v3_0/describing-parameters/
  description?: string;
}

/**
 * Structure of a single Swagger route documentation entry.
 *
 * @typedef {Object} SwaggerRouteDefinition
 * @property {HTTPMethod} method - HTTP method (GET, POST, PUT, etc.)
 * @property {string} path - Route path (/users, /fun/random)
 * @property {{ text: string }} [description] - Optional description text
 * @property {JsonObject} [body] - Optional request body example
 */
export type SwaggerRouteDefinition = {
  method: HTTPMethod;
  path: string;
  description?: { text: string };
  body?: { default?: JsonObject } & JsonObject;
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
  responses?: Record<number | string, { description?: string; schema?: any } & JsonObject>;
};
