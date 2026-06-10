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

/**
 * Singleton manager for defining and registering reusable OpenAPI components/schemas (Entities).
 * Registered schemas are automatically injected into `#/components/schemas`.
 */
export class SchemaManager {
  private static instance: SchemaManager;
  private registry: Map<string, OpenAPISchema> = new Map();

  private constructor() {}

  /**
   * Gets the singleton instance of the SchemaManager.
   */
  static getInstance(): SchemaManager {
    if (!SchemaManager.instance) {
      SchemaManager.instance = new SchemaManager();
    }
    return SchemaManager.instance;
  }

  /**
   * Defines and registers a new schema.
   *
   * @param {string} name - The unique name of the schema (e.g., 'User').
   * @param {Record<string, SchemaPropertyDef>} properties - Map of property names to their definitions.
   * @param {string} [description] - Optional description for the entire schema.
   * @returns {OpenAPISchema} The registered schema object.
   *
   * @example
   * defineSchema('User', {
   *   id: { type: 'integer', required: true, example: 1 },
   *   name: { type: 'string', required: true, example: 'John' }
   * });
   */
  define(
    name: string,
    properties: Record<string, SchemaPropertyDef>,
    description?: string,
  ): OpenAPISchema {
    const requiredFields: string[] = [];
    const cleanProps: Record<string, Omit<SchemaPropertyDef, 'required'>> = {};
    const example: Record<string, unknown> = {};

    for (const [key, def] of Object.entries(properties ?? {})) {
      if (def?.required) requiredFields.push(key);
      if (def?.example !== undefined) example[key] = def.example;

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { required: _req, ...rest } = def;
      cleanProps[key] = rest;
    }

    const schema: OpenAPISchema = {
      type: 'object',
      ...(requiredFields.length ? { required: requiredFields } : {}),
      properties: cleanProps,
      ...(description ? { description } : {}),
      ...(Object.keys(example).length ? { example } : {}),
    };

    this.registry.set(name, schema);
    return schema;
  }

  /**
   * Returns all registered schemas as a plain object.
   * @returns {Record<string, OpenAPISchema>} Map of schema names to their objects.
   */
  getSchemas(): Record<string, OpenAPISchema> {
    return Object.fromEntries(this.registry);
  }

  /**
   * Helper to create an OpenAPI $ref string for a registered schema.
   *
   * @param {string} name - The name of the schema.
   * @returns {string} The reference string (e.g., '#/components/schemas/User').
   */
  static ref(name: string): string {
    return `#/components/schemas/${name}`;
  }

  /**
   * Clears all registered schemas from the registry.
   */
  clear(): void {
    this.registry.clear();
  }
}

// ---------------------------------------------------------------------------
//  Functional Exports
// ---------------------------------------------------------------------------

const manager = SchemaManager.getInstance();

/**
 * Defines a new reusable schema (Entity).
 * Registered schemas automatically appear in the Swagger UI under "Schemas".
 *
 * @param {string} name - Schema name.
 * @param {Record<string, SchemaPropertyDef>} properties - Property definitions.
 * @param {string} [description] - Optional description.
 * @returns {OpenAPISchema} The registered schema object.
 */
export const defineSchema = (
  name: string,
  properties: Record<string, SchemaPropertyDef>,
  description?: string,
) => manager.define(name, properties, description);

/**
 * Defines a new reusable schema (Entity) with strong TypeScript typing.
 * This ensures that the schema definition matches your TypeScript interface/type.
 *
 * @example
 * interface User {
 *   id: number;
 *   name: string;
 * }
 *
 * defineEntity<User>('User', {
 *   id: { type: 'integer', required: true, example: 1 },
 *   name: { type: 'string', required: true, example: 'John Doe' }
 * });
 */
export function defineEntity<T>(
  name: string,
  properties: { [K in keyof T]: SchemaPropertyDef },
  description?: string,
): OpenAPISchema {
  return manager.define(name, properties, description);
}

/**
 * Automatically defines a schema by inferring types from a JavaScript example object.
 * This is the easiest way to build an "entity" based on your actual data structure.
 *
 * @example
 * const exampleUser = { id: 1, name: 'John', isActive: true };
 * defineEntityFromExample('User', exampleUser, 'A user entity inferred from example');
 */
export function defineEntityFromExample<T extends object>(
  name: string,
  example: T,
  description?: string,
): OpenAPISchema {
  const properties: Record<string, SchemaPropertyDef> = {};

  for (const [key, value] of Object.entries(example ?? {})) {
    properties[key] = {
      type: inferSwaggerType(value),
      example: value,
      required: true,
    };
  }

  return manager.define(name, properties, description);
}

/**
 * Generates a `$ref` string for a registered schema.
 * Use this in route definitions for request bodies or responses.
 *
 * @param {string} name - Schema name to reference.
 * @returns {string} OpenAPI `$ref` string (e.g. `'#/components/schemas/User'`).
 * @example
 * createSwaggerRoute({
 *   path: '/users',
 *   body: { $ref: schemaRef('User') }
 * });
 */
export const schemaRef = (name: string) => SchemaManager.ref(name);

/**
 * Gets all registered schemas. Internal use only.
 * @returns {Record<string, OpenAPISchema>} Map of schema names to their objects.
 */
export const getRegisteredSchemas = () => manager.getSchemas();

/**
 * Clears the schema registry.
 * @returns {void}
 */
export const clearSchemas = () => manager.clear();

function inferSwaggerType<T = unknown>(value: T): SchemaPropertyType {
  const jsType = typeof value;
  if (value === null) {
    return 'string';
  }

  if (jsType === 'number') return Number.isInteger(value) ? 'integer' : 'number';
  if (jsType === 'boolean') return 'boolean';
  if (Array.isArray(value)) return 'array';
  if (value !== null && jsType === 'object') return 'object';

  return 'string';
}
