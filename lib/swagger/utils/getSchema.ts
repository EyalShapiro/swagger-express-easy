export function getSchema(body: any) {
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
