import type { JsonObject } from 'swagger-ui-express';
import type { SwaggerRouteDefinition } from '../routeStore/type';

export function getSchema<TBody extends JsonObject>(body: TBody) {
  if ('$ref' in body) return { $ref: body.$ref };

  if ('type' in body && body.type === 'object') return body; // Direct schema

  const properties: Record<string, Record<string, unknown>> = {};
  for (const [key, val] of Object.entries(body)) {
    if (key === 'default') continue;
    const type = typeof val;
    properties[key] = { type: type === 'object' ? 'object' : type, example: val };
  }
  const requiredNotDefault = Object.keys(body).filter((k) => k !== 'default');
  return { type: 'object', required: requiredNotDefault, properties };
}
export function separateParameters(parameters: SwaggerRouteDefinition['parameters']) {
  const formDataParams = [];
  const regularParams = [];

  for (const p of parameters ?? []) {
    if (p.in === 'formData') formDataParams.push(p);
    else regularParams.push(p);
  }
  return { formDataParams, regularParams };
}

/**
 * Build formData for OpenAPI 3.0 requestBody (multipart/form-data)
 * @param formDataParams - Array of formData parameters
 * @returns Object with required fields and formData
 */
export function buildFormData(formDataParams: SwaggerRouteDefinition['parameters']) {
  if (!formDataParams || formDataParams.length === 0) return undefined;
  const properties: JsonObject = {};
  const required: string[] = [];
  const encoding: JsonObject = {};
  for (const param of formDataParams) {
    const name = param.name || 'file';

    if (param.type === 'file') {
      // Single file upload
      properties[name] = { type: 'string', format: 'binary' };
    } else if (param.type === 'array' && param.items?.type === 'file') {
      // Multiple file upload
      properties[name] = {
        type: 'array',
        items: { type: 'string', format: 'binary' },
      };
      encoding[name] = { contentType: 'application/octet-stream' };
    } else {
      // Regular formData field
      properties[name] = { type: param.type || 'string' };
    }

    if (param.description) properties[name].description = param.description;
    if (param.required) required.push(name);
  }

  const formData = {
    schema: {
      type: 'object',
      properties,
      ...(required.length > 0 ? { required } : {}),
    },
    ...(Object.keys(encoding).length > 0 ? { encoding } : {}),
  };
  return {
    required: required.length > 0,
    content: {
      'multipart/form-data': formData,
    },
  };
}
