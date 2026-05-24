process.env.SWAGGER = 'true';
import { generateSwaggerDocs } from './swagger-auto';
import { SWAGGER_CONFIG } from './swagger-config';
import path from 'path';

// Loads environment variables from the default .env file
export const SWAGGER_WORK = (process.env?.SWAGGER || 'false')?.trim()?.toLowerCase() === 'true';
console.log('SWAGGER_WORK:', SWAGGER_WORK);

(async () => {
  try {
    // Attempt to load the entry point files to register manual routes (createSwaggerRoutes)
    const endpoints = SWAGGER_CONFIG.endpointsRoutes || [];
    for (const file of endpoints) {
      try {
        const absolutePath = path.resolve(process.cwd(), file);
        // We use require to dynamically load the files. This triggers createSwaggerRoutes calls.
        await import(absolutePath);
      } catch (e) {
        if (SWAGGER_CONFIG.debug) {
          console.warn(
            `\n\x1b[33m[swagger-express-easy] Warning: Failed to import or map route file "${file}". It might not be documented properly.\x1b[0m\n`,
            e,
          );
        }
      }
    }

    await generateSwaggerDocs();
  } catch (error) {
    console.error(error);
    if (SWAGGER_WORK) process.exit(1);
  } finally {
    console.log('\x1b[33m--finally block executed generateSwaggerDocs\x1b[0m\n');
    if (SWAGGER_WORK) process.exit(0);
  }
})();
