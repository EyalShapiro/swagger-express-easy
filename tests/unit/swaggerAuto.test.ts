import express from 'express';
import { SwaggerAuto } from '../../lib/swagger';
import * as functions from '../../lib/swagger/utils/functions';

jest.mock('../../lib/swagger/utils/functions');
jest.mock('../../lib/swagger/swaggerAuto');

describe('SwaggerAuto Class', () => {
  let app: any;

  beforeEach(() => {
    app = express() as any;
    jest.clearAllMocks();
  });

  test('should initialize with custom options', () => {
    const swagger = new SwaggerAuto(app, {
      path: '/api-docs-custom',
      outputFile: 'custom.json',
      watch: false
    });

    expect(swagger['options'].path).toBe('/api-docs-custom');
    expect(swagger['options'].outputFile).toBe('custom.json');
  });

  test('setup should respect custom outputFile', async () => {
    const swagger = new SwaggerAuto(app, {
      outputFile: 'my-custom-swagger.json',
      watch: false
    });

    // We need to mock readSwaggerFile to see if it's called with the right path
    const readSpy = jest.spyOn(functions, 'readSwaggerFile').mockResolvedValue({});
    
    await swagger.setup();
    
    // Check if readSwaggerFile was called with the custom path
    expect(readSpy).toHaveBeenCalledWith(expect.stringContaining('my-custom-swagger.json'));
  });
});
