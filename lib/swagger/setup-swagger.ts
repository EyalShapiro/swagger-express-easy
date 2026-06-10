import { type Express } from 'express';
import type { SwaggerSetupOptions } from '../types/internal';
import { generateDocument } from '../core/generator';
import { buildSwaggerConfig } from './helpers';
import { customSwaggerMiddleware } from './middleware';
import type { SwaggerDocument } from 'swagger-express-easy/types/swagger';

import { FileWatcher } from '../core/watcher';
import { logError } from '../utils/logger';

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
  private watcher: FileWatcher | null = null;

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
    const swaggerPath = this.options?.path ?? '/api-docs';

    try {
      this.swaggerDocument = await generateDocument(this.app, config);

      const optionsMiddleware = {
        swaggerDocument: this.swaggerDocument,
        swaggerUiOptions: this.options?.swaggerUiOptions as Record<string, unknown> | undefined,
      };

      this.mountSwaggerUI(swaggerPath, optionsMiddleware);

      if (this.options?.watch) {
        this.startWatcher(config, optionsMiddleware);
      }
    } catch (err) {
      logError('Failed to initialize Swagger.', err);
      this.mountFallbackHandler(swaggerPath);
    }

    return { path: swaggerPath, document: this.swaggerDocument };
  }

  private mountSwaggerUI(
    swaggerPath: string,
    optionsMiddleware: {
      swaggerDocument: SwaggerDocument | Record<string, unknown> | undefined;
      swaggerUiOptions?: Record<string, unknown>;
    },
  ): void {
    this.app.use(swaggerPath, customSwaggerMiddleware(optionsMiddleware as any));
  }

  private mountFallbackHandler(swaggerPath: string): void {
    this.app.use(swaggerPath, (_req, res) => {
      res.status(500).json({ error: 'Swagger Initialization Failed' });
    });
  }

  private startWatcher(
    config: ReturnType<typeof buildSwaggerConfig>,
    optionsMiddleware: {
      swaggerDocument: SwaggerDocument | Record<string, unknown> | undefined;
    },
  ): void {
    this.watcher = new FileWatcher(async () => {
      try {
        this.swaggerDocument = await generateDocument(this.app, config);
        optionsMiddleware.swaggerDocument = this.swaggerDocument;
      } catch (err) {
        logError('Failed to regenerate Swagger document during watch.', err);
      }
    });

    // Determine paths to watch based on config or default to 'src'
    const pathsToWatch = config.endpointsRoutes?.length
      ? config.endpointsRoutes.map(p => p.replace(/\*.*$/, '')) // strip glob parts for directories
      : [process.cwd()];

    this.watcher.start(pathsToWatch);
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
export async function setupSwagger(
  app: Express,
  options: SwaggerSetupOptions = {},
): Promise<Express> {
  const manager = new SwaggerManager(app, options);
  await manager.setup();
  return app;
}
