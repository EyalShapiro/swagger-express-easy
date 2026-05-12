import { generateSwaggerDocs } from './swaggerAuto';
import { SWAGGER_CONFIG } from './swagger.config';
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
        // Ignore load errors for individual files during build step
        console.error(e);
      }
    }

    await generateSwaggerDocs();
  } catch (error) {
    console.error(error);
  } finally {
    console.log('\x1b[33m--finally block executed generateSwaggerDocs\x1b[0m\n');
    if (SWAGGER_WORK) process.exit(1);
  }
})();
