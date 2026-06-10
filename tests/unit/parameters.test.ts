import { parseRoutes } from '../../lib/core/parser';
import { mergeManualRoutes } from '../../lib/core/merger';
import { SwaggerRouteStore } from '../../lib/swagger/routeStore';
import type { SwaggerDocument } from '../../lib/types/swagger';
import type { ParsedRoute } from '../../lib/types/express';

describe('Path and Query Parameters Generation', () => {
  beforeEach(() => {
    SwaggerRouteStore.getData().clear();
  });

  test('should automatically generate path parameter for single path parameter', () => {
    const mockRoutes: ParsedRoute[] = [
      {
        path: '/api/ping/:id',
        method: 'get',
        middlewares: [],
        handler: () => {},
        meta: {},
      },
    ];

    const result = parseRoutes(mockRoutes, false);
    const pathItem = result.paths['/api/ping/{id}'];
    expect(pathItem).toBeDefined();
    expect(pathItem.get).toBeDefined();
    expect(pathItem.get?.parameters).toBeDefined();
    expect(pathItem.get?.parameters).toHaveLength(1);
    expect(pathItem.get?.parameters?.[0]).toEqual({
      name: 'id',
      in: 'path',
      required: true,
      schema: { type: 'string' },
    });
  });

  test('should automatically generate path parameters for multiple path parameters', () => {
    const mockRoutes: ParsedRoute[] = [
      {
        path: '/api/ping/:id1/:id2',
        method: 'get',
        middlewares: [],
        handler: () => {},
        meta: {},
      },
    ];

    const result = parseRoutes(mockRoutes, false);
    const pathItem = result.paths['/api/ping/{id1}/{id2}'];
    expect(pathItem).toBeDefined();
    expect(pathItem.get).toBeDefined();
    expect(pathItem.get?.parameters).toBeDefined();
    expect(pathItem.get?.parameters).toHaveLength(2);
    expect(pathItem.get?.parameters).toEqual([
      {
        name: 'id1',
        in: 'path',
        required: true,
        schema: { type: 'string' },
      },
      {
        name: 'id2',
        in: 'path',
        required: true,
        schema: { type: 'string' },
      },
    ]);
  });

  test('should support path + query parameters using manual route definitions', () => {
    const mockRoutes: ParsedRoute[] = [
      {
        path: '/api/user/:id',
        method: 'get',
        middlewares: [],
        handler: () => {},
        meta: {},
      },
    ];

    // 1. Generate base document containing parsed dynamic route
    const doc: SwaggerDocument = {
      openapi: '3.0.0',
      info: { title: 'Test API', version: '1.0.0' },
      paths: parseRoutes(mockRoutes, false).paths,
    };

    // 2. Add manual definition with a query helper
    SwaggerRouteStore.addRoute({
      method: 'get',
      path: '/api/user/:id',
      query: {
        role: { type: 'string', required: false, description: 'Role filter' },
      },
    });

    mergeManualRoutes(doc, false);

    const pathItem = doc.paths?.['/api/user/{id}'];
    expect(pathItem).toBeDefined();
    expect(pathItem?.get).toBeDefined();
    expect(pathItem?.get?.parameters).toBeDefined();
    expect(pathItem?.get?.parameters).toHaveLength(2);

    // Should contain both the auto-detected path parameter 'id' and the manual query parameter 'role'
    const idParam = pathItem?.get?.parameters?.find((p) => p.name === 'id');
    const roleParam = pathItem?.get?.parameters?.find((p) => p.name === 'role');

    expect(idParam).toEqual({
      name: 'id',
      in: 'path',
      required: true,
      schema: { type: 'string' },
    });

    expect(roleParam).toEqual({
      name: 'role',
      in: 'query',
      required: false,
      description: 'Role filter',
      schema: { type: 'string' },
    });
  });

  test('should support path parameters with custom schema definition via manual route', () => {
    const mockRoutes: ParsedRoute[] = [
      {
        path: '/api/ping/:id',
        method: 'get',
        middlewares: [],
        handler: () => {},
        meta: {},
      },
    ];

    const doc: SwaggerDocument = {
      openapi: '3.0.0',
      info: { title: 'Test API', version: '1.0.0' },
      paths: parseRoutes(mockRoutes, false).paths,
    };

    SwaggerRouteStore.addRoute({
      method: 'get',
      path: '/api/ping/:id',
      params: {
        id: {
          type: 'integer',
          description: 'A numeric ID',
          schema: { type: 'integer', minimum: 1 },
        },
      },
    });

    mergeManualRoutes(doc, false);

    const pathItem = doc.paths?.['/api/ping/{id}'];
    expect(pathItem).toBeDefined();
    expect(pathItem?.get).toBeDefined();
    expect(pathItem?.get?.parameters).toBeDefined();
    expect(pathItem?.get?.parameters).toHaveLength(1);

    expect(pathItem?.get?.parameters?.[0]).toEqual({
      name: 'id',
      in: 'path',
      required: true,
      description: 'A numeric ID',
      schema: {
        type: 'integer',
        minimum: 1,
      },
    });
  });
});
