import path from 'path';
import fs from 'fs';
import swaggerAutogenFactory from 'swagger-autogen';
import { JsonObject, SwaggerOptions } from 'swagger-ui-express';

import { SWAGGER_CONFIG, SwaggerConfigOptions } from './swagger-config';
import { updateSwaggerFile } from './utils/fs-helper';
import { applyCustomRouteDescriptions, organizeSwaggerTags } from './utils/sorted-data';
import { getRegisteredSchemas } from './schemas';

const FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
function loadingBar(i: number, basePath: string) {
  process.stdout.write(`\r\x1b[36m${FRAMES[i]} Scanning routes for "${basePath}"...\x1b[0m`);
}

/**
 * Generates Swagger documentation by merging auto-generated and custom route data.
 */
export async function generateSwaggerDocs(
  swaggerConfig: SwaggerConfigOptions & { document: SwaggerOptions } = SWAGGER_CONFIG,
): Promise<JsonObject> {
  let interval: NodeJS.Timeout | null = null;
  try {
    const fullPath = path.resolve(
      process.cwd(),
      swaggerConfig?.outputFile ?? 'swagger-output.json',
    );
    const basePath = swaggerConfig.basePath || '/';

    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) {
      await fs.promises.mkdir(dir, { recursive: true });
    }

    // Start loading spinner
    let i = 0;
    interval = setInterval(() => {
      loadingBar(i, basePath);
      i = (i + 1) % FRAMES.length;
    }, 80);

    const autogenOptions = {
      openapi: '3.0.0', // swagger-autogen requires exactly '3.0.0' to enable OpenAPI v3 mode
      autoHeaders: true,
      autoBody: true,
      autoQuery: true,
      autoResponse: true,
    };
    const generator = swaggerAutogenFactory(autogenOptions);

    const endpoints = (swaggerConfig.endpointsRoutes || ['./src/app.ts']).map((f) =>
      path.resolve(process.cwd(), f),
    );

    // Call the generator
    const result = await generator(fullPath, endpoints, swaggerConfig.document);

    if (
      (!result || !result.success) &&
      swaggerConfig.debug &&
      process.env.NODE_ENV !== 'production'
    ) {
      console.warn(
        '\n\x1b[33m[swagger-express-easy] Warning: Failed to automatically map some dynamic routers.\x1b[0m\n',
      );
    }

    const swaggerDocument = await applyCustomRouteDescriptions(fullPath, basePath, undefined, {
      caseSensitive: swaggerConfig.caseSensitive,
    });

    // Inject registered schemas
    const schemas = getRegisteredSchemas();
    if (Object.keys(schemas).length > 0) {
      if (!swaggerDocument.components) swaggerDocument.components = {};
      swaggerDocument.components.schemas = {
        ...swaggerDocument.components.schemas,
        ...schemas,
      };
    }

    // Organize tags
    const organizedSwaggerDoc = organizeSwaggerTags(
      swaggerDocument,
      basePath,
      swaggerConfig.tagsOrder,
    );

    // Final update
    await updateSwaggerFile(organizedSwaggerDoc, fullPath);

    if (interval) clearInterval(interval);
    process.stdout.write('\r\x1b[K');
    console.info(`\x1b[32m✔ Swagger documentation updated: ${fullPath}\x1b[0m`);

    return organizedSwaggerDoc;
  } catch (error) {
    if (interval) clearInterval(interval);
    process.stdout.write('\r\x1b[K');
    console.error('\n\x1b[31m✖ Failed to generate Swagger docs:\x1b[0m', error);
    throw error;
  }
}
