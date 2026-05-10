import { NextFunction, Request, Response } from 'express';
import { IS_PROD } from '../config';
import ERROR_MSG from '../constant/error_msg';

/**
 * Creates a standardized error JSON object for responses.
 *
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @param {number} statusCode - HTTP status code to include in the error JSON.
 * @param {string} errMsg - The error message to include.
 * @returns {{ message: string, timeStamp: string, statusCode: number, originalUrl: string, method: string }}
 */
export function createErrorJson(req: Request, res: Response, statusCode: number, errMsg: string) {
  const timeStamp = res.locals?.timeStamp || new Date().toUTCString();
  const message = `${errMsg} ${ERROR_MSG.accessOriginalUrl(req)} ${!IS_PROD && ` | ${ERROR_MSG.swagger}`}`;
  const method = req?.method || '';
  const errJson = { message, timeStamp, statusCode, originalUrl: req?.originalUrl || '', method };

  if (!IS_PROD) console.error(errJson);

  return errJson;
}

/**
 * Middleware for handling 500 and general server errors.
 *
 * @param {Error} error - The error object.
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - The next middleware function.
 */
export function errorHandler(error: Error, req: Request, res: Response, next: NextFunction) {
  const message = `Error: ${error?.message || ERROR_MSG.internal}`;
  const statusCode = 500;
  if (!IS_PROD) console.error(error);
  const errJson = { ...createErrorJson(req, res, statusCode, message), error };

  res.status(statusCode).json(errJson);
  next();
}

/**
 * Middleware for handling 404 Not Found errors.
 *
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - The next middleware function.
 */
export function notFound404Handle(req: Request, res: Response, next: NextFunction) {
  if (req.path.startsWith('/api-docs') && !IS_PROD) return next(); // Allow swagger-ui assets and JSON through

  const statusCode = 404;
  const message = ERROR_MSG.notFound;

  const errJson = createErrorJson(req, res, statusCode, message);

  res.status(statusCode).json(errJson);
}
