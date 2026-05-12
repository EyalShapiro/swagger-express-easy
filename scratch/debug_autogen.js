const swaggerAutogen = require('swagger-autogen')({ openapi: '3.0.3' });
const path = require('path');

const outputFile = path.resolve(__dirname, 'test-swagger.json');
const endpointsFiles = [path.resolve(process.cwd(), './src/app.ts')];

console.log('Scanning files:', endpointsFiles);

swaggerAutogen(outputFile, endpointsFiles, {})
  .then((result) => {
    console.log('Result:', result ? 'Success' : 'Failed');
    if (!result) {
      console.error('Generation returned null/false');
    }
  })
  .catch((err) => {
    console.error('Error during generation:', err);
  });
