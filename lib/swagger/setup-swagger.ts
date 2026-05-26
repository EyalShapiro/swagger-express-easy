import type { Express } from 'express';
import type { SwaggerSetupOptions } from '../types/internal';
import { generateDocument } from '../core/generator';
import { buildSwaggerConfig } from './helpers';
import { customSwaggerMiddleware } from './middleware';
import type { SwaggerDocument } from 'swagger-express-easy/types/swagger';

/**
 * Core manager class for generating and serving the Swagger/OpenAPI document.
 * Handles document generation via `swagger-autogen`, route scanning, and UI mounting.
 *
 * @example
 * const mgr = new SwaggerManager(app, { path: '/docs', watch: true });
 * await mgr.setup();
 */
export class SwaggerManager {
  private app: Express;
  private options: SwaggerSetupOptions;
  private swaggerDocument: SwaggerDocument | Record<string, unknown> | undefined;

  /**
   * @param {Express} app - The Express application instance.
   * @param {SwaggerSetupOptions} [options={}] - Configuration options.
   */
  constructor(app: Express, options: SwaggerSetupOptions = {}) {
    this.app = app;
    this.options = { path: '/api-docs', watch: false, ...options };
  }

  /**
   * Initializes the document generation and mounts the Swagger UI.
   *
   * @returns {Promise<{ path: string; document: SwaggerDocument | Record<string, unknown> | undefined }>}
   *   The mounted path and the generated document.
   */
  async setup(): Promise<{
    path: string;
    document: SwaggerDocument | Record<string, unknown> | undefined;
  }> {
    const config = buildSwaggerConfig(this.options);
    const swaggerPath = this.options.path || '/api-docs';

    try {
      this.swaggerDocument = await generateDocument(this.app, config);

      if (this.options.watch) {
        // Basic watch mode: in a real implementation this would hook into fs.watch
        // or a middleware that regenerates on request in non-prod.
        this.app.use(swaggerPath, async (req, res, next) => {
          this.swaggerDocument = await generateDocument(this.app, config);
          next();
        });
      }

      this.app.use(
        swaggerPath,
        customSwaggerMiddleware({
          swaggerDocument: this.swaggerDocument,
          swaggerUiOptions: this.options.swaggerUiOptions,
        }),
      );
    } catch (err) {
      console.error('\x1b[31m[swagger-express-easy] Failed to initialize Swagger.\x1b[0m', err);
      // Fallback
      this.app.use(swaggerPath, (req, res) => {
        res.status(500).json({ error: 'Swagger Initialization Failed' });
      });
    }

    return { path: swaggerPath, document: this.swaggerDocument };
  }
}

/**
 * High-level setup function.
 * Creates a `SwaggerManager`, runs `setup()`, and returns the Express app.
 *
 * @param {Express} app - The Express application instance.
 * @param {SwaggerSetupOptions} [options={}] - Configuration options.
 * @returns {Promise<Express>} The same Express app (for chaining).
 * @example
 * await setupSwagger(app, { path: '/docs', outputFile: './swagger.json' });
 */
export async function setupSwagger(app: Express, options: SwaggerSetupOptions = {}) {
  const manager = new SwaggerManager(app, options);
  await manager.setup();
  return app;
}
