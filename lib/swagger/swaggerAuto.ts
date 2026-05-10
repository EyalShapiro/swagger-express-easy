import path from 'path';
import { JsonObject } from 'swagger-ui-express';
import swaggerAutogen from 'swagger-autogen';
import { SWAGGER_CONFIG } from './swagger.config';
import { updateSwaggerFile } from './utils/functions';
import { applyCustomRouteDescriptions, organizeSwaggerTags } from './utils/sortedData';
import { getRegisteredSchemas } from './schemas';

/**
 * Generates Swagger documentation by merging auto-generated and custom route data.
 * @returns The generated Swagger document object (JsonObject).
 */
export async function generateSwaggerDocs(swaggerConfig = SWAGGER_CONFIG): Promise<JsonObject> {
  try {
    console.info('Generating Swagger docs...');
    const fullPath = path.resolve(process.cwd(), swaggerConfig.outputFile);


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

    console.info(
      `\x1b[1m[info]\x1b[0m: Swagger docs generated successfully at path "${fullPath}" `,
    );
    return organizedSwaggerDoc;
  } catch (error) {
    console.error('\n\x1b[31mError generating Swagger docs:\x1b[0m', error);
    throw error;
  }
}

