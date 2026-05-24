import { Express, Request, Response, NextFunction } from 'express';
import swaggerUi from 'swagger-ui-express';
import http from 'http';
import { generateSwaggerDocs } from './swagger-auto';
import { getAddrFormatToLocal } from './utils/path-helper';
import { readSwaggerFile } from './utils/fs-helper';
import { SwaggerConfigOptions, buildSwaggerConfig, ResolvedSwaggerConfig } from './swagger-config';
import { applyCustomRouteDescriptions, organizeSwaggerTags } from './utils/sorted-data';
import { IS_PROD } from './env-config';

// ---------------------------------------------------------------------------
//  Types
// ---------------------------------------------------------------------------

export interface SwaggerSetupOptions extends SwaggerConfigOptions {
  path?: string;
  swaggerUiOptions?: swaggerUi.SwaggerUiOptions;
  watch?: boolean;
}

// ---------------------------------------------------------------------------
//  Main Class
// ---------------------------------------------------------------------------

export class SwaggerAuto {
  private app: Express;
  private options: SwaggerSetupOptions;
  private swaggerDocument: any = null;
  private initializationError: Error | null = null;
  private config: ResolvedSwaggerConfig;
  private detectedServerUrl: string | null = null;

  constructor(app: Express, options: SwaggerSetupOptions = {}) {
    this.app = app;
    this.options = { path: '/api-docs', watch: false, ...options };
    this.config = buildSwaggerConfig(this.options);
  }

  /**
   * Safe setup to prevent crashing the user's application.
   */
  async setup(): Promise<{ path?: string; document?: any }> {
    const swaggerPath = this.options.path || '/api-docs';

    try {
      const customSwaggerHandler = (req: Request, res: Response, next: NextFunction) => {
        if (res.headersSent) return;

        // If there was an error during init, show it instead of crashing
        if (this.initializationError) {
          return res.status(500).json({
            error: 'Swagger failed to initialize',
            message: this.initializationError.message,
          });
        }

        // Inject the detected server URL into the document dynamically on each request,
        // so that the Swagger UI dropdown always reflects the actual running server.
        let doc = this.swaggerDocument;
        if (this.detectedServerUrl && doc) {
          doc = {
            ...doc,
            servers: [
              { url: this.detectedServerUrl, description: 'Local server' },
              ...(doc.servers || []).filter(
                (s: any) => s.url && s.url !== '' && s.url !== this.detectedServerUrl,
              ),
            ],
          };
        }

        const uiOptions: swaggerUi.SwaggerUiOptions = {
          ...this.options?.swaggerUiOptions,
        };
        const swaggerControls = swaggerUi.setup(doc, uiOptions);
        return swaggerControls(req, res, next);
      };

      if (this.options.watch) {
        this.app.use(swaggerPath, async (_req: Request, _res: Response, next: NextFunction) => {
          try {
            this.swaggerDocument = await generateSwaggerDocs(this.config);
          } catch (err) {
            console.error('[swagger-express-easy] Watch regeneration failed:', err);
          }
          next();
        });

        this.swaggerDocument = await generateSwaggerDocs(this.config);
      } else {
        const rawDocument = await getSwaggerDocument(this.options);
        const filteredDoc = await applyCustomRouteDescriptions(
          this.config.outputFile,
          this.config.basePath,
          rawDocument,
        );
        this.swaggerDocument = organizeSwaggerTags(
          filteredDoc,
          this.config.basePath,
          this.config.tagsOrder,
        );
      }

      this.app.use(swaggerPath, swaggerUi.serve, customSwaggerHandler);
    } catch (err: unknown) {
      this.initializationError = err as Error;
      console.error('\x1b[31m[swagger-express-easy] Failed to initialize Swagger.\x1b[0m');

      // Fallback handler
      this.app.use(swaggerPath, (req: Request, res: Response) => {
        res.status(500).json({
          error: 'Swagger Initialization Failed',
          details: (err as Error)?.message || 'Unknown error',
          instruction: 'Please check your configuration or routes for errors.',
        });
      });
    }

    return { path: swaggerPath, document: this.swaggerDocument };
  }

  useServer(server: http.Server) {
    server.on('listening', () => {
      const addr = server.address();
      if (addr && typeof addr === 'object') {
        const port = addr.port;
        const host = getAddrFormatToLocal(addr.address);
        this.detectedServerUrl = `http://${host}:${port}`;

        if (this.swaggerDocument) {
          // Update the live document so /api-docs.json always returns correct servers
          this.swaggerDocument.servers = [
            { url: this.detectedServerUrl, description: 'Local server' },
          ];
          // Support swagger-autogen host field
          this.swaggerDocument.host = `${host}:${port}`;
        }
      }
    });
    return server;
  }

  listen(
    port: number | string,
    callback?: () => void,
  ): { server?: http.Server; app?: Express; port?: number | string } {
    const server = this.app.listen(port, callback);
    this.useServer(server);
    SwaggerAuto.handleServerErrors(server, port);
    return { server, app: this.app, port };
  }
  getApp() {
    return this.app;
  }
  static handleServerErrors(server: http.Server, port: string | number) {
    server.on('error', (error: any) => {
      if (error?.code === 'EADDRINUSE') {
        // Suppress or warn gently
      }
    });
  }
}

export async function setupSwagger(app: Express, options: SwaggerSetupOptions = {}) {
  const instance = new SwaggerAuto(app, options);
  return instance.setup();
}

export async function getSwaggerDocument(configOptions?: SwaggerConfigOptions) {
  const config = buildSwaggerConfig(configOptions);
  try {
    // Only use cached file from disk in production to support read-only file systems
    if (IS_PROD) {
      const doc = await readSwaggerFile(config.outputFile).catch(() => null);
      if (doc && Object.keys(doc).length > 0) {
        return doc;
      }
    }
    // In development/testing, always generate fresh documentation to reflect latest route changes
    return await generateSwaggerDocs(config);
  } catch (error) {
    console.error(error);
    return await generateSwaggerDocs(config);
  }
}
