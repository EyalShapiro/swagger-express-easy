import { JsonObject } from 'swagger-ui-express';
import { readSwaggerFile } from './fs-helper';
import { normalizePath } from './path-helper';
import { SwaggerRouteStore } from '../routeStore';
import { getSchema } from './getSchema';

/**
 * Organizes Swagger document paths into tags based on the segments of the path,
 * and optionally sorts tags according to a tagsOrder array.
 */
export function organizeSwaggerTags(
  swaggerDocument: JsonObject,
  basePath: string = '/',
  tagsOrder?: string[],
): JsonObject {
  const normalizedBase = basePath.replace(/^\/|\/$/g, '').toLowerCase();

  if (!swaggerDocument.paths) return swaggerDocument;

  swaggerDocument.tags = swaggerDocument.tags || [];
  type SwaggerTag = { name: string; description?: string };
  const tagsArray = swaggerDocument.tags as SwaggerTag[];
  const existingTagNames = new Set(tagsArray.map((t) => t.name));

  for (const pathKey of Object.keys(swaggerDocument.paths)) {
    const segments = pathKey.split('/').filter(Boolean);
    let tagName = 'default';

    if (segments.length > 0) {
      const isBaseTagNane =
        normalizedBase && segments[0]?.toLowerCase() === normalizedBase && segments.length > 1;
      tagName = segments[isBaseTagNane ? 1 : 0];
    }

    if (!existingTagNames.has(tagName)) {
      const description = `${tagName?.charAt(0)?.toUpperCase() + tagName?.slice(1)} endpoints`;
      tagsArray.push({ name: tagName, description });
      existingTagNames.add(tagName);
    }

    const pathItem = swaggerDocument.paths[pathKey];
    for (const method of Object.keys(pathItem)) {
      const operation = pathItem[method];
      if (operation && typeof operation === 'object') {
        const op = operation as any;
        op.tags = op.tags || [];
        if (!op.tags.includes(tagName)) {
          op.tags.push(tagName);
        }
      }
    }
  }

  // Sort tags according to tagsOrder if provided
  if (tagsOrder && tagsOrder.length > 0) {
    const orderMap = tagsOrder.reduce((acc, tag, index) => {
      acc.set(tag.toLowerCase(), index);
      return acc;
    }, new Map<string, number>());

    (swaggerDocument.tags as SwaggerTag[]).sort((a, b) => {
      const aIdx = orderMap.get(a.name.toLowerCase()) ?? tagsOrder.length + 1;
      const bIdx = orderMap.get(b.name.toLowerCase()) ?? tagsOrder.length + 1;

      if (aIdx !== bIdx) return aIdx - bIdx;
      // For unspecified tags, sort alphabetically
      return a.name.localeCompare(b.name);
    });
  }

  return swaggerDocument;
}

/**
 * Deduplicates parameters by name and 'in' location.
 */
function mergeParameters(existing: any[] = [], incoming: any[] = []) {
  const map = new Map<string, any>();

  // Add existing
  for (const p of existing) {
    const key = `${p.name}-${p.in}`;
    map.set(key, p);
  }

  // Overwrite with incoming
  for (const p of incoming) {
    const key = `${p.name}-${p.in}`;
    map.set(key, p);
  }

  return Array.from(map.values());
}

/**
 * Applies custom route descriptions and filters paths for multi-instance isolation.
 */
export async function applyCustomRouteDescriptions(
  fullPath: string,
  basePath: string = '/',
  doc?: JsonObject,
) {
  const normalizedBase = (basePath.startsWith('/') ? basePath : `/${basePath}`).toLowerCase();

  // Use provided document or read from disk.
  const swaggerDocument = doc || (await readSwaggerFile(fullPath));
  if (!swaggerDocument.paths) swaggerDocument.paths = {};

  // Ensure basic OpenAPI structure if missing
  if (!swaggerDocument.openapi && !swaggerDocument.swagger) {
    swaggerDocument.openapi = '3.0.3';
  }

  // Filter custom routes from the global store that match this instance's base path
  const allCustomRoutes = SwaggerRouteStore.getRouteList();
  const customRoutes = allCustomRoutes.filter(({ path }) => {
    const routePath = path?.startsWith('/') ? path.toLowerCase() : `/${path.toLowerCase()}`;
    return normalizedBase === '/' || routePath.startsWith(normalizedBase);
  });

  // Automatic Path Prefixing for multi-instance isolation
  if (normalizedBase !== '/') {
    const properBase = basePath?.startsWith('/') ? basePath : `/${basePath}`;
    const prefixedPaths: JsonObject = {};
    const cleanBase = properBase?.endsWith('/') ? properBase?.slice(0, -1) : properBase;

    for (const [pathKey, pathValue] of Object.entries(swaggerDocument.paths || {})) {
      if (pathKey.toLowerCase().startsWith(normalizedBase)) {
        const cleanPath = pathKey?.startsWith('/') ? pathKey : `/${pathKey}`;
        const newPathKey = `${cleanBase}${cleanPath}`.replace(/\/+/g, '/');
        prefixedPaths[newPathKey] = pathValue;
      } else {
        prefixedPaths[pathKey] = pathValue;
      }
    }
    swaggerDocument.paths = prefixedPaths;

    // Filter paths on the document to match this instance's base path for isolation
    swaggerDocument.paths = Object.fromEntries(
      Object.entries(swaggerDocument.paths).filter(([pathKey]) => {
        return pathKey?.toLowerCase()?.startsWith(normalizedBase);
      }),
    );
  }

  // In OpenAPI 3, basePath is handled via servers[].url.
  // We'll ensure that servers has the correct base URL.
  if (normalizedBase !== '/') {
    if (
      !swaggerDocument.servers ||
      swaggerDocument.servers.length === 0 ||
      swaggerDocument.servers[0].url === ''
    ) {
      swaggerDocument.servers = [{ url: normalizedBase }];
    } else {
      swaggerDocument.servers = swaggerDocument.servers.map((s: any) => {
        if (!s.url.endsWith(normalizedBase)) {
          s.url = s.url.replace(/\/$/, '') + normalizedBase;
        }
        return s;
      });
    }
  }

  // Create a lookup map of normalized paths from the filtered document.
  const autoGeneratedPaths: { [normalizedPath: string]: string } = {};
  for (const p of Object.keys(swaggerDocument.paths)) {
    autoGeneratedPaths[normalizePath(p).toLowerCase()] = p;
  }

  // Merge custom route data
  for (const route of customRoutes) {
    const normalizedCustomPath = normalizePath(route.path).toLowerCase();

    // Use any to bypass persistent TS2322 compilation error
    let originalPath: any = autoGeneratedPaths[normalizedCustomPath];
    if (!originalPath) {
      // Try fuzzy matching (e.g. param syntax :id -> {id})
      const openApiStyle = normalizedCustomPath.replace(/:([a-zA-Z0-9_]+)/g, '{$1}');
      originalPath =
        autoGeneratedPaths[openApiStyle] ||
        Object.keys(autoGeneratedPaths).find(
          (p) => p.endsWith(openApiStyle) || openApiStyle.endsWith(p),
        );
    }

    // If path still doesn't exist, we CREATE it
    if (!originalPath) {
      originalPath = route.path.startsWith('/') ? route.path : `/${route.path}`;
      if (!swaggerDocument.paths[originalPath]) {
        swaggerDocument.paths[originalPath] = {};
      }
    }

    if (originalPath) {
      const { method, description, body, parameters, responses } = route;
      const pathItem = swaggerDocument.paths[originalPath];

      // Ensure the method object exists
      if (!pathItem[method]) {
        pathItem[method] = {
          responses: responses || { 200: { description: 'OK' } },
        };
      }

      const op = pathItem[method];
      let requestBody = undefined;
      if (body && typeof body === 'object') {
        const schema: Record<string, unknown> = getSchema(body);
        requestBody = { content: { 'application/json': { schema } } };
      }

      op.description = (description?.text || op.description || '') as string;
      if (description?.summary) op.summary = description.summary;
      if (requestBody) op.requestBody = requestBody;

      if (route.consumes) op.consumes = route.consumes;
      if (route.produces) op.produces = route.produces;

      const combinedTags = [...(op.tags || [])];
      if (route.tag) combinedTags.push(route.tag);
      if (route.tags) combinedTags.push(...route.tags);
      if (combinedTags.length > 0) {
        op.tags = Array.from(new Set(combinedTags));
      }

      // Fix for duplicated parameters: deduplicate by name and in location
      if (parameters && Array.isArray(parameters)) {
        // Separate formData params (Swagger 2.0) from standard OpenAPI 3 params
        const formDataParams = parameters.filter((p) => p.in === 'formData');
        const regularParams = parameters.filter((p) => p.in !== 'formData');

        if (formDataParams.length > 0) {
          // Convert formData params to OpenAPI 3.0 requestBody (multipart/form-data)
          const properties: Record<string, any> = {};
          const required: string[] = [];
          const encoding: Record<string, any> = {};

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

          op.requestBody = {
            required: required.length > 0,
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  properties,
                  ...(required.length > 0 ? { required } : {}),
                },
                ...(Object.keys(encoding).length > 0 ? { encoding } : {}),
              },
            },
          };
        }

        if (regularParams.length > 0) {
          op.parameters = mergeParameters(op.parameters, regularParams);
        }
      }

      if (responses && typeof responses === 'object') {
        op.responses = { ...(op.responses || {}), ...responses };
      }

      if (route.security) op.security = route.security;
    }
  }

  return swaggerDocument;
}
