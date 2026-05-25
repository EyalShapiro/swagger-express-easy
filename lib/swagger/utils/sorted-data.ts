import { JsonObject } from 'swagger-ui-express';
import { readSwaggerFile } from './fs-helper';
import { convertExpressToOpenApiPath, normalizePath } from './path-helper';
import { SwaggerRouteStore } from '../routeStore';
import { buildFormData, getSchema, separateParameters } from './getSchema';
import { mergeByKey } from './helpers';

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
        const op = operation;
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
 * Applies custom route descriptions and filters paths for multi-instance isolation.
 */
export async function applyCustomRouteDescriptions(
  fullPath: string,
  basePath: string = '/',
  doc?: JsonObject,
  configOptions?: { caseSensitive?: boolean },
) {
  const normalizedBase = (basePath.startsWith('/') ? basePath : `/${basePath}`).toLowerCase();
  const isCaseSensitive = configOptions?.caseSensitive ?? false;

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

  // Automatic Path Prefixing for multi-instance isolation & MAUI base URL compatibility
  if (normalizedBase !== '/') {
    const properBase = basePath?.startsWith('/') ? basePath : `/${basePath}`;
    const cleanBase = properBase?.endsWith('/') ? properBase?.slice(0, -1) : properBase;
    const prefixedPaths: JsonObject = {};

    for (const [pathKey, pathValue] of Object.entries(swaggerDocument.paths || {})) {
      const lowerKey = pathKey.toLowerCase();
      // If the path already has the base path, preserve it.
      // Otherwise, prefix it with the base path.
      if (lowerKey.startsWith(normalizedBase)) {
        prefixedPaths[pathKey] = pathValue;
      } else {
        const cleanPath = pathKey?.startsWith('/') ? pathKey : `/${pathKey}`;
        const newPathKey = `${cleanBase}${cleanPath}`.replace(/\/+/g, '/');
        prefixedPaths[newPathKey] = pathValue;
      }
    }
    swaggerDocument.paths = prefixedPaths;
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
      swaggerDocument.servers = (swaggerDocument.servers as { url: string }[]).map((s) => {
        if (!s.url.endsWith(normalizedBase)) {
          s.url = s.url.replace(/\/$/, '') + normalizedBase;
        }
        return s;
      });
    }
  }

  // Define matcher based on caseSensitive configuration
  const matchPath = (p: string) =>
    isCaseSensitive ? normalizePath(p) : normalizePath(p).toLowerCase();

  // Create a lookup map of matched paths from the filtered document.
  const autoGeneratedPaths: { [normalizedPath: string]: string } = {};
  for (const p of Object.keys(swaggerDocument.paths)) {
    autoGeneratedPaths[matchPath(p)] = p;
  }

  // Merge custom route data
  for (const route of customRoutes) {
    const isRouteCaseSensitive =
      route.caseSensitive !== undefined ? route.caseSensitive : isCaseSensitive;
    const routeMatchPath = (p: string) =>
      isRouteCaseSensitive ? normalizePath(p) : normalizePath(p).toLowerCase();

    const normalizedCustomPath = routeMatchPath(route.path);

    let originalPath: string | undefined = autoGeneratedPaths[normalizedCustomPath];
    if (!originalPath) {
      // Try fuzzy matching (e.g. param syntax :id -> {id})
      const openApiStyle = routeMatchPath(convertExpressToOpenApiPath(route.path));
      originalPath =
        autoGeneratedPaths[openApiStyle] ||
        Object.keys(autoGeneratedPaths).find((p) => {
          const normP = routeMatchPath(p);
          return normP.endsWith(openApiStyle) || openApiStyle.endsWith(normP);
        });
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

      if (route.deprecated !== undefined) {
        op.deprecated = route.deprecated;
      }

      const combinedTags = [...(op.tags || [])];
      if (route.tag) combinedTags.push(route.tag);
      if (route.tags) combinedTags.push(...route.tags);
      if (combinedTags.length > 0) {
        op.tags = Array.from(new Set(combinedTags));
      }

      // Fix for duplicated parameters: deduplicate by name and in location
      if (parameters && Array.isArray(parameters)) {
        // Separate formData params (Swagger 2.0) from standard OpenAPI 3 params
        const { formDataParams, regularParams } = separateParameters(parameters);

        // Convert formData params to OpenAPI 3.0 requestBody (multipart/form-data)
        const requestBody = buildFormData(formDataParams);
        if (requestBody) op.requestBody = requestBody;

        if (regularParams.length > 0) {
          const mergedParams = mergeByKey(op.parameters, regularParams, (p) => `${p.name}-${p.in}`);
          if (mergedParams) op.parameters = mergedParams;
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
