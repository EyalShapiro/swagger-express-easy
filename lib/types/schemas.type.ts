/**
 * Supported OpenAPI data types for schema properties.
 */
export type SchemaPropertyType =
  | 'string'
  | 'integer'
  | 'number'
  | 'boolean'
  | 'array'
  | 'object'
  | 'null';
/**
 * Definition of a single property inside an OpenAPI schema.
 */

export interface SchemaPropertyDef<T = unknown> {
  /**
   * The data type of the property.
   */
  type: SchemaPropertyType;

  /**
   * Whether this property is required.
   * @default false
   */
  required?: boolean;

  /**
   * OpenAPI format hint.
   * Examples: 'email', 'date-time', 'int64', 'uuid'.
   */
  format?: string;

  /**
   * An example value for this property to be displayed in Swagger UI.
   */
  example?: T;

  /**
   * A human-readable description of the property.
   */
  description?: string;

  /**
   * For type: 'array' — defines the schema of the items within the array.
   */
  items?: { type: SchemaPropertyType } & Record<string, unknown>;

  /**
   * For type: 'object' — defines the nested properties of the object.
   */
  properties?: Record<string, SchemaPropertyDef>;

  /**
   * Possible enum values for the property.
   */
  enum?: unknown[];

  /**
   * The default value for the property.
   */
  default?: unknown;
}
/**
 * Represents a fully resolved OpenAPI schema object in the Swagger document.
 */

export interface OpenAPISchema {
  type: 'object';
  required?: string[];
  properties: Record<string, Omit<SchemaPropertyDef, 'required'>>;
  description?: string;
  example?: Record<string, unknown>;
}
