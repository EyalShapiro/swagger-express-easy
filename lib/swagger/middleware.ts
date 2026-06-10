import type { Request, Response, NextFunction, RequestHandler } from 'express';
import swaggerUi from 'swagger-ui-express';

import type { SwaggerDocument } from '../types/swagger';
import { cloneDocument } from '../utils/object';

export interface CustomSwaggerMiddlewareOptions {
  swaggerDocument: SwaggerDocument;
  swaggerUiOptions?: swaggerUi.SwaggerUiOptions | undefined;
  darkMode?: boolean;
}

/**
 * Creates an Express middleware array for Swagger UI.
 * Supports optional dark mode via CSS filter inversion.
 *
 * @param {CustomSwaggerMiddlewareOptions} options - Swagger document, UI options, and dark mode flag.
 * @returns {RequestHandler[]} Array of Express middleware handlers that serve the Swagger UI.
 * @example
 * app.use('/docs', customSwaggerMiddleware({ swaggerDocument: doc, darkMode: true }));
 */
export function customSwaggerMiddleware(options: CustomSwaggerMiddlewareOptions): RequestHandler[] {
  const uiOptions = { ...options.swaggerUiOptions };

  if (options.darkMode) {
    uiOptions.customCss = [
      uiOptions.customCss,
      '.swagger-ui { filter: invert(88%) hue-rotate(180deg); }',
      '.swagger-ui .microlight { filter: invert(100%) hue-rotate(180deg); }',
    ]
      .filter(Boolean)
      .join('\n');
  }

  const swaggerMiddleware = (req: Request, res: Response, next: NextFunction) => {
    if (res.headersSent) return;

    const doc = cloneDocument(options.swaggerDocument, {});

    const protocol = req.protocol;
    const host = req.get('host') || 'localhost';
    const requestUrl = `${protocol}://${host}/`;

    if (
      !doc.servers ||
      doc.servers.length === 0 ||
      (doc.servers.length === 1 && doc.servers[0].url === 'http://localhost:3000/')
    ) {
      doc.servers = [{ url: requestUrl }];
    }

    const setupMw = swaggerUi.setup(doc, uiOptions);
    return setupMw(req, res, next);
  };
  return [...swaggerUi.serve, swaggerMiddleware];
}
