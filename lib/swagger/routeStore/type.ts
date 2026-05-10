import { OutgoingMessage } from 'http';
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
export type HeadersType = OutgoingMessage['getHeaders'];
export type ContentType<T extends HeadersType = HeadersType> = T | (() => T);
export interface ParametersType {
  in?: 'query' | 'header' | 'path' | 'cookie' | 'formData' | (string & {});
  name?: string;
  required?: boolean;
  schema?: { type: string } & Record<string, any>; //https://swagger.io/docs/specification/v3_0/describing-parameters/
  description?: string;
  default?: any;
}

/**
 * Structure of a single Swagger route documentation entry.
 *
 * @typedef {Object} SwaggerRouteDefinition
 * @property {HTTPMethod} method - HTTP method (GET, POST, PUT, etc.)
 * @property {string} path - Route path (/users, /fun/random)
 * @property {{ text: string }} [description] - Optional description text
 * @property {Record<string, any>} [body] - Optional request body example
 */
export type SwaggerRouteDefinition = {
  method: HTTPMethod;
  path: string;
  description?: { text: string };
  body?: { default?: Record<string, any> } & Record<string, any>;
  parameters?: Array<ParametersType & Record<string, any>>;
  /** Media types the API can consume (e.g. ['multipart/form-data']) */
  consumes?: string[];
  /** Media types the API can produce (e.g. ['application/json']) */
  produces?: string[];
  /** List of tags for this route */
  tags?: string[];
};

