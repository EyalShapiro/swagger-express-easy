import { generateSwaggerDocs } from './swaggerAuto';
// Loads environment variables from the default .env file
export const SWAGGER_WORK = (process.env?.SWAGGER || 'false')?.trim()?.toLowerCase() === 'true';
console.log('SWAGGER_WORK:', SWAGGER_WORK);

(async () => {
  try {
    await generateSwaggerDocs();
  } catch (error) {
    console.error(error);
  } finally {
    console.log('\x1b[33m--finally block executed generateSwaggerDocs\x1b[0m\n');
    if (SWAGGER_WORK) process.exit(1);
  }
})();
