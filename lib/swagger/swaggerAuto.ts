import path from 'path';
import { JsonObject } from 'swagger-ui-express';
import swaggerAutogen from 'swagger-autogen';
import { SWAGGER_CONFIG, SwaggerConfigOptions } from './swagger.config';
import { updateSwaggerFile } from './utils/functions';
import { applyCustomRouteDescriptions, organizeSwaggerTags } from './utils/sortedData';
import { getRegisteredSchemas } from './schemas';
const FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

/**
 * Generates Swagger documentation by merging auto-generated and custom route data.
 * @returns The generated Swagger document object (JsonObject).
 */
export async function generateSwaggerDocs(
  swaggerConfig: SwaggerConfigOptions & { document: any } = SWAGGER_CONFIG,
): Promise<JsonObject> {
  let interval: NodeJS.Timeout | null = null;
  try {
    const fullPath = path.resolve(process.cwd(), swaggerConfig?.outputFile ?? '');

    // Start loading spinner
    let i = 0;
    interval = setInterval(() => {
      process.stdout.write(
        `\r\x1b[36m${FRAMES[i]} Generating Swagger docs for ${swaggerConfig.basePath || 'API'}...\x1b[0m`,
      );
      i = (i + 1) % FRAMES.length;
    }, 80);

    // Generate the base swagger documentation file from API endpoints.
    await swaggerAutogen({ openapi: '3.0.3', autoHeaders: true, autoBody: true })(
      fullPath,
      swaggerConfig.endpointsRoutes,
      swaggerConfig.document,
    );

    const swaggerDocument = await applyCustomRouteDescriptions(fullPath);

    // Inject registered schemas into components.schemas
    const schemas = getRegisteredSchemas();
    if (Object.keys(schemas).length > 0) {
      if (!swaggerDocument.components) swaggerDocument.components = {};
      swaggerDocument.components.schemas = {
        ...swaggerDocument.components.schemas,
        ...schemas,
      };
    }

    // Organize tags for all paths.
    const organizedSwaggerDoc = organizeSwaggerTags(swaggerDocument);

    // Write the final, updated swagger document once.
    await updateSwaggerFile(organizedSwaggerDoc, fullPath);

    // Stop spinner and show success
    if (interval) clearInterval(interval);
    process.stdout.write('\r\x1b[K'); // Clear the line
    console.info(`\x1b[32m✔ Swagger docs generated successfully at "${fullPath}"\x1b[0m`);

    return organizedSwaggerDoc;
  } catch (error) {
    if (interval) clearInterval(interval);
    process.stdout.write('\r\x1b[K');
    console.error('\n\x1b[31m✖ Error generating Swagger docs:\x1b[0m', error);
    throw error;
  }
}
