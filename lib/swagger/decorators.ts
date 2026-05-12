/* eslint-disable @typescript-eslint/no-explicit-any */
import * as core from 'express-serve-static-core';
import { RequestHandler } from 'express';
import { SwaggerRouteDefinition, createSwaggerRoute } from './routeStore';

/**
 * Wrapper function for standard Express route handlers.
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
): RequestHandler<P, ResBody, ReqBody, ReqQuery, Locals> {
  createSwaggerRoute(routeDef);
  return handler;
}

/**
 * A strongly-typed wrapper for Express route handlers.
 */
export function withTypedSwagger<
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
    T extends { body?: infer B } ? B : any,
    ReqQuery,
    Locals
  >,
): RequestHandler<Params, ResBody, T extends { body?: infer B } ? B : any, ReqQuery, Locals> {
  createSwaggerRoute(routeDef);
  return handler as any;
}

/**
 * Method decorator for class-based Express controllers.
 */
export function SwaggerRoute(routeDef: SwaggerRouteDefinition) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    createSwaggerRoute(routeDef);
    return descriptor;
  };
}
