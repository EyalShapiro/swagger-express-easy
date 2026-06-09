import { RequestHandler } from 'express';
import * as core from 'express-serve-static-core';

import { createSwaggerRoute } from './routeStore';
import { SwaggerRouteDefinition } from './routeStore/type';

/**
 * Class Method Decorator for Swagger Documentation.
 * Use this if you are using ES6 Classes for your controllers.
 *
 * @param {SwaggerRouteDefinition} routeDef - Swagger route definition.
 * @returns {Function} A stage-1/stage-2 decorator that registers the route and returns the original descriptor.
 * @example
 * class UserController {
 *   \@SwaggerRoute({ method: 'get', path: '/api/users', description: { text: 'Get users' } })
 *   getUsers(req: Request, res: Response) { ... }
 * }
 */
export function SwaggerRoute(routeDef: SwaggerRouteDefinition) {
  return function (
    target: object,
    propertyKey?: string | symbol,
    descriptor?: PropertyDescriptor,
  ): PropertyDescriptor | object {
    createSwaggerRoute(routeDef);
    return descriptor ?? target;
  };
}

/**
 * Wrapper function for standard Express route handlers (since TS doesn't support decorators on plain functions).
 *
 * Registers the route in the Swagger store and returns the original handler unchanged.
 * Prefer this overload when you don't need to infer the body type from `routeDef`.
 *
 * @param {SwaggerRouteDefinition} routeDef - Swagger route definition.
 * @param {RequestHandler<P, ResBody, ReqBody, ReqQuery, Locals>} handler - Express request handler.
 * @returns {RequestHandler<P, ResBody, ReqBody, ReqQuery, Locals>} The original handler (unchanged).
 * @example
 * export const getHello = withSwagger({ method: 'get', path: '/api/hello' }, (req, res) => {
 *   res.json({ hello: 'world' });
 * });
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
export function withSwagger<
  P = core.ParamsDictionary,
  ResBody = any,
  ReqBody = any,
  ReqQuery = core.Query,
  Locals extends Record<string, any> = Record<string, any>,
>(
  routeDef: SwaggerRouteDefinition,
  handler: RequestHandler<P, ResBody, ReqBody, ReqQuery, Locals>,
): RequestHandler<P, ResBody, ReqBody, ReqQuery, Locals>;

/**
 * A strongly-typed wrapper for Express route handlers.
 * Infers the request body type from `routeDef.body` so you get full IDE autocomplete on `req.body`.
 * Use this overload when your route definition carries a `body` schema with a `default` example
 * or an explicit TypeScript type.
 *
 * @param {T} routeDef - Swagger route definition whose `body` field drives the inferred body type.
 * @param handler - Express request handler; `req.body` is typed from `T['body']`.
 * @returns {RequestHandler} The original handler (unchanged), with the body type resolved.
 * @example
 * export const calculate = withSwagger<{ expression: string }>(
 *   { method: 'post', path: '/calculate' },
 *   (req, res) => {
 *     console.log(req.body.expression); // Fully typed!
 *   }
 * );
 */
export function withSwagger<
  T extends SwaggerRouteDefinition,
  Params = core.ParamsDictionary,
  ResBody = any,
  ReqQuery = core.Query,
  Locals extends Record<string, any> = Record<string, any>,
>(
  routeDef: T,
  handler: RequestHandler<
    Params,
    ResBody,
    T['body'] extends { default: infer D } ? D : T['body'] extends undefined ? any : T['body'],
    ReqQuery,
    Locals
  >,
): RequestHandler<
  Params,
  ResBody,
  T['body'] extends { default: infer D } ? D : T['body'] extends undefined ? any : T['body'],
  ReqQuery,
  Locals
> {
  createSwaggerRoute(routeDef);
  return handler;
}
/* eslint-enable @typescript-eslint/no-explicit-any */
