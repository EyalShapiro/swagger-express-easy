import { SwaggerRouteStore, createSwaggerRoute, createSwaggerRoutes } from '../../lib/swagger/routeStore';

describe('SwaggerRouteStore', () => {
  beforeEach(() => {
    SwaggerRouteStore.getData().clear();
  });

  test('should add a single route', () => {
    SwaggerRouteStore.addRoute({
      method: 'get',
      path: '/api/test',
      description: { text: 'Test route' },
      tags: ['Test']
    });

    const routes = SwaggerRouteStore.getRouteList();
    expect(routes).toHaveLength(1);
    expect(routes[0].path).toBe('/api/test');
    expect(routes[0].method).toBe('get');
  });

  test('should overwrite route with same method and path', () => {
    SwaggerRouteStore.addRoute({
      method: 'post',
      path: '/api/duplicate',
      description: { text: 'First description' },
    });

    SwaggerRouteStore.addRoute({
      method: 'post',
      path: '/api/duplicate',
      description: { text: 'Second description' },
    });

    const routes = SwaggerRouteStore.getRouteList();
    expect(routes).toHaveLength(1);
    expect(routes[0].description?.text).toBe('Second description');
  });

  test('createSwaggerRoute should act as an alias to addRoute', () => {
    createSwaggerRoute({
      method: 'delete',
      path: '/api/delete-test',
    });

    const routes = SwaggerRouteStore.getRouteList();
    expect(routes).toHaveLength(1);
    expect(routes[0].method).toBe('delete');
    expect(routes[0].path).toBe('/api/delete-test');
  });

  test('createSwaggerRoutes should add multiple routes', () => {
    createSwaggerRoutes([
      { method: 'get', path: '/api/multiple1' },
      { method: 'get', path: '/api/multiple2' },
    ]);

    const routes = SwaggerRouteStore.getRouteList();
    expect(routes).toHaveLength(2);
    expect(routes[0].path).toBe('/api/multiple1');
    expect(routes[1].path).toBe('/api/multiple2');
  });
});
