import { Express, Request, Response, NextFunction } from 'express';
import swaggerUi from 'swagger-ui-express';
import http from 'http';
import { generateSwaggerDocs } from './swaggerAuto';
import { getAddrFormatToLocal, readSwaggerFile } from './utils/functions';
import { SwaggerConfigOptions, buildSwaggerConfig, ResolvedSwaggerConfig } from './swagger.config';
import { applyCustomRouteDescriptions, organizeSwaggerTags } from './utils/sortedData';

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

        const uiOptions: swaggerUi.SwaggerUiOptions = {
          ...this.options?.swaggerUiOptions,
        };
        const swaggerControls = swaggerUi.setup(this.swaggerDocument, uiOptions);
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
        this.swaggerDocument = organizeSwaggerTags(filteredDoc, this.config.basePath);
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

        if (this.swaggerDocument) {
          this.swaggerDocument.servers = [
            { url: `http://${host}:${port}`, description: 'Auto-detected server' },
          ];
          // Support swagger-autogen host field
          this.swaggerDocument.host = `${host}:${port}`;
        }
      }
    });
  }

  listen(
    port: number | string,
    callback?: () => void,
  ): { server?: http.Server; app?: Express; port?: number | string } {
    if (process.env.SWAGGER_SKIP_LISTEN === 'true') {
      return { server: undefined, app: this.app, port };
    }

    const server = this.app.listen(port, callback);
    this.useServer(server);
    SwaggerAuto.handleServerErrors(server, port);
    return { server, app: this.app, port };
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
    return (
      (await readSwaggerFile(config.outputFile).catch(() => null)) ??
      (await generateSwaggerDocs(config))
    );
  } catch {
    return await generateSwaggerDocs(config);
  }
}
