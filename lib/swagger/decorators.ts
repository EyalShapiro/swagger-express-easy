import { createSwaggerRoute } from './routeStore';
import { SwaggerRouteDefinition } from './routeStore/type';

/**
 * Class Method Decorator for Swagger Documentation.
 * Use this if you are using ES6 Classes for your controllers.
 * 
 * @example
 * class UserController {
 *   \@SwaggerRoute({ method: 'get', path: '/api/users', description: { text: 'Get users' } })
 *   getUsers(req: Request, res: Response) { ... }
 * }
 */
export function SwaggerRoute(routeDef: SwaggerRouteDefinition) {
  return function (target: any, propertyKey?: any, descriptor?: any) {
    createSwaggerRoute(routeDef);
    return descriptor || target;
  };
}

/**
 * Wrapper function for standard Express route handlers (since TS doesn't support decorators on plain functions).
 * 
 * @example
 * export const getHello = withSwagger({ method: 'get', path: '/api/hello' }, (req, res) => { ... });
 */
export function withSwagger<T extends Function>(routeDef: SwaggerRouteDefinition, handler: T): T {
  createSwaggerRoute(routeDef);
  return handler;
}
