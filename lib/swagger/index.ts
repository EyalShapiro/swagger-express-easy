import { Express, Request, Response, NextFunction } from 'express';
import swaggerUi, { JsonObject } from 'swagger-ui-express';
import http from 'http';
import { generateSwaggerDocs } from './swaggerAuto';
import { readSwaggerFile } from './utils/functions';
import { SwaggerConfigOptions, buildSwaggerConfig } from './swagger.config';

// ---------------------------------------------------------------------------
//  Types
// ---------------------------------------------------------------------------

/**
 * Options for setting up Swagger in an Express application.
 * Extends the base configuration options.
 */
export interface SwaggerSetupOptions extends SwaggerConfigOptions {
  /**
   * The URL path where Swagger UI will be served.
   * @default '/api-docs'
   */
  path?: string;

  /**
   * Custom options for the swagger-ui-express middleware.
   * Allows customizing CSS, JS, explorer, etc.
   */
  swaggerUiOptions?: swaggerUi.SwaggerUiOptions;

  /**
   * Enables watch mode.
   * When true, the Swagger documentation will be regenerated on every request
   * to the Swagger UI path. This is extremely useful during development.
   * @default false
   */
  watch?: boolean;
}

// ---------------------------------------------------------------------------
//  Main Class
// ---------------------------------------------------------------------------

/**
 * The core engine of swagger-express-easy.
 * Encapsulates the logic for generating, serving, and managing Swagger documentation.
 *
 * @example
 * const swagger = new SwaggerAuto(app, { watch: true });
 * await swagger.setup();
 */
export class SwaggerAuto {
  private app: Express;
  private options: SwaggerSetupOptions;
  private swaggerDocument: JsonObject | null = null;

  /**
   * Creates an instance of SwaggerAuto.
   * @param {Express} app - The Express application instance.
   * @param {SwaggerSetupOptions} [options={}] - Configuration options.
   */
  constructor(app: Express, options: SwaggerSetupOptions = {}) {
    this.app = app;
    this.options = { path: '/api-docs', watch: false, ...options };
  }

  /**
   * Initializes the Swagger UI middleware and handles documentation generation.
   * In watch mode, it adds a middleware to regenerate the docs on every request.
   *
   * @returns {Promise<{ path: string; document: any }>} The path where Swagger is served and the generated document.
   */
  async setup(): Promise<{ path: string; document: any }> {
    const config = buildSwaggerConfig(this.options);
    const swaggerPath = this.options.path!;
    const customSwaggerHandler = (req: Request, res: Response, next: NextFunction) => {
      if (res.headersSent) return;
      const uiOptions: swaggerUi.SwaggerUiOptions = {
        ...this.options?.swaggerUiOptions,
      };
      const swaggerControls = swaggerUi.setup(this.swaggerDocument, uiOptions);
      return swaggerControls(req, res, next);
    };

    if (this.options.watch) {
      // In watch mode, regenerate the doc on every request to the swagger path
      this.app.use(swaggerPath, async (_req: Request, _res: Response, next: NextFunction) => {
        try {
          this.swaggerDocument = await generateSwaggerDocs(config);
        } catch (err) {
          console.error('[swagger-express-easy] watch regeneration failed:', err);
        }
        next();
      });

      // Initial generation
      this.swaggerDocument = await generateSwaggerDocs(config);

      this.app.use(swaggerPath, swaggerUi.serve, customSwaggerHandler);
    } else {
      // Standard mode — generate once or read from disk
      this.swaggerDocument = await getSwaggerDocument(this.options);

      this.app.use(swaggerPath, swaggerUi.serve, customSwaggerHandler);
    }

    return {
      path: swaggerPath,
      document: this.swaggerDocument,
    };
  }

  /**
   * Binds the SwaggerAuto instance to a running HTTP server.
   * Automatically detects the listening port and host, and updates the
   * Swagger documentation with the correct server URL.
   *
   * @param {http.Server} server - The HTTP server instance.
   * @example
   * const server = http.createServer(app);
   * swagger.useServer(server);
   * server.listen(PORT);
   */
  useServer(server: http.Server) {
    server.on('listening', () => {
      const addr = server.address();
      if (addr && typeof addr === 'object') {
        const port = addr.port;
        const host = addr.address === '::' ? 'localhost' : addr.address;

        if (this.swaggerDocument) {
          this.swaggerDocument.servers = [
            { url: `http://${host}:${port}`, description: 'Auto-detected server' },
          ];
          this.swaggerDocument.host = `${host}:${port}`;
        }
        console.info(`[swagger-express-easy] Auto-detected server at http://${host}:${port}`);
      }
    });
  }

  /**
   * Starts the Express server and automatically binds Swagger detection and error handling.
   * This is the easiest way to start your application.
   *
   * @param {number | string} port - The port to listen on.
   * @param {() => void} [callback] - Optional callback when the server starts.
   * @returns {{ server: http.Server; app: Express; port: number | string }} An object containing the server, app, and port.
   *
   * @example
   * const { server, port } = swagger.listen(3000);
   */
  listen(
    port: number | string,
    callback?: () => void,
  ): { server: http.Server; app: Express; port: number | string } {
    const server = this.app.listen(port, callback);
    this.useServer(server);
    SwaggerAuto.handleServerErrors(server, port);
    return { server, app: this.app, port };
  }

  /**
   * Utility to handle common server errors like port already in use (EADDRINUSE).
   * Automatically exits the process with code 1 if the port is busy,
   * allowing tools like nodemon to restart the process cleanly.
   *
   * @param {http.Server} server - The Node.js HTTP server instance.
   * @param {string | number} port - The port number or pipe string.
   */
  static handleServerErrors(server: http.Server, port: string | number) {
    server.on('error', (error: any) => {
      if (error?.code === 'EADDRINUSE') {
        console.error(
          `\x1b[33m[swagger-express-easy] Port ${port} is already in use. Exiting to allow restart...\x1b[0m`,
        );
        process.exit(1);
      }
      console.error(`\x1b[31m[swagger-express-easy] Server Error on port ${port}:\x1b[0m`, error);
    });
  }
}

/**
 * Convenient functional wrapper for setting up Swagger.
 * Recommended for simple applications.
 *
 * @param {Express} app - The Express application.
 * @param {SwaggerSetupOptions} [options={}] - Setup options.
 * @returns {Promise<{ path: string; document: any }>} Setup results.
 *
 * @example
 * import { setupSwagger } from 'swagger-express-easy';
 * await setupSwagger(app, { watch: true, path: '/docs' });
 */
export async function setupSwagger(app: Express, options: SwaggerSetupOptions = {}) {
  const instance = new SwaggerAuto(app, options);
  return instance.setup();
}

/**
 * Generates and returns the full Swagger document object.
 * Useful for exporting the documentation to other tools or custom hosting.
 *
 * @param {SwaggerConfigOptions} [configOptions] - Configuration options.
 * @returns {Promise<any>} The generated Swagger document.
 *
 * @example
 * const doc = await getSwaggerDocument({ port: 3000 });
 * console.log(doc.paths);
 */
export async function getSwaggerDocument(configOptions?: SwaggerConfigOptions) {
  const config = buildSwaggerConfig(configOptions);
  return (
    (await readSwaggerFile(config.outputFile).catch(() => null)) ??
    (await generateSwaggerDocs(config))
  );
}

/**
 * Convenient functional wrapper for static server error handling.
 *
 * @param {Server} server - The Server instance.
 * @param {string | number} port - The port.
 *
 * @example
 * const server = http.createServer(app);
 * handleServerErrors(server, PORT);
 * server.listen(PORT);
 */
export function handleServerErrors(server: http.Server, port: string | number) {
  SwaggerAuto.handleServerErrors(server, port);
}
