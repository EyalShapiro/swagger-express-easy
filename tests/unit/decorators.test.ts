import { withSwagger, SwaggerRoute } from '../../lib/swagger/decorators';
import { SwaggerRouteStore } from '../../lib/swagger/routeStore';

describe('Decorators & Wrappers', () => {
  beforeEach(() => {
    SwaggerRouteStore.getData().clear();
  });

  test('withSwagger should register a route and return the function', () => {
    const handler = (req: any, res: any) => res.send('ok');
    const wrapped = withSwagger({ method: 'get', path: '/api/test' }, handler);

    expect(wrapped).toBe(handler);
    const routes = SwaggerRouteStore.getRouteList();
    expect(routes).toHaveLength(1);
    expect(routes[0].path).toBe('/api/test');
  });

  test('SwaggerRoute should register a route for a class method', () => {
    class TestController {
      @SwaggerRoute({ method: 'post', path: '/api/class-test' })
      handle(req: any, res: any) {}
    }

    // Instantiating to ensure decorator runs if not evaluated earlier
    new TestController();

    const routes = SwaggerRouteStore.getRouteList();
    expect(routes).toHaveLength(1);
    expect(routes[0].path).toBe('/api/class-test');
    expect(routes[0].method).toBe('post');
  });
});
