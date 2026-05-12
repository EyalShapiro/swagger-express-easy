/* eslint-disable @typescript-eslint/no-explicit-any */
import { RequestHandler } from 'express';
import * as core from 'express-serve-static-core';

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
 * Allows you to define TypeScript interfaces for Body, Query, and Params,
 * while automatically registering the route to Swagger.
 *
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
