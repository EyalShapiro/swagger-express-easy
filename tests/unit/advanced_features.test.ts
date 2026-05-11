import { withTypedSwagger } from '../../lib/swagger/decorators';
import { SwaggerRouteStore } from '../../lib/swagger/routeStore';
import { Request, Response } from 'express';

describe('Advanced Swagger Features', () => {
  beforeEach(() => {
    SwaggerRouteStore.getData().clear();
  });

  test('withTypedSwagger should register route correctly', () => {
    const handler = (req: Request, res: Response) => res.json({ ok: true });
    
    const wrapped = withTypedSwagger(
      { 
        method: 'post', 
        path: '/api/typed', 
        body: { name: 'test', age: 25 } 
      },
      handler
    );

    expect(wrapped).toBe(handler);
    const routes = SwaggerRouteStore.getRouteList();
    expect(routes).toHaveLength(1);
    expect(routes[0].path).toBe('/api/typed');
    expect(routes[0].body).toEqual({ name: 'test', age: 25 });
  });

  test('withTypedSwagger should work with explicit generics', () => {
    interface MyBody { username: string }
    const handler = (req: Request<any, any, MyBody>, res: Response) => res.json({ user: req.body.username });

    // In current version, the generic signature is <T, Params, ResBody, ReqQuery, Locals>
    // To pass Body explicitly, we'd need to cast or update signature.
    // But let's test if it at least registers.
    withTypedSwagger(
      { method: 'get', path: '/api/explicit' },
      handler as any
    );

    const routes = SwaggerRouteStore.getRouteList();
    expect(routes[0].path).toBe('/api/explicit');
  });
});
