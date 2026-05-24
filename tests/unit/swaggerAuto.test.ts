import express from 'express';
import { SwaggerAuto, setupSwagger } from '../../lib/swagger';
import * as fsHelper from '../../lib/swagger/utils/fs-helper';

jest.mock('../../lib/swagger/utils/fs-helper');
jest.mock('../../lib/swagger/swagger-auto');

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
    const readSpy = jest.spyOn(fsHelper, 'readSwaggerFile').mockResolvedValue({});
    
    await swagger.setup();
    
    // Check if readSwaggerFile was called with the custom path
    expect(readSpy).toHaveBeenCalledWith(expect.stringContaining('my-custom-swagger.json'));
  });
});

describe('setupSwagger Function', () => {
  let app: any;

  beforeEach(() => {
    app = express() as any;
    jest.clearAllMocks();
  });

  test('should successfully call setupSwagger and return path and document', async () => {
    const readSpy = jest.spyOn(fsHelper, 'readSwaggerFile').mockResolvedValue({
      openapi: '3.0.0',
      info: { title: 'Test API' },
      paths: {}
    });

    const result = await setupSwagger(app, {
      path: '/my-custom-path',
      outputFile: 'my-custom-swagger.json',
      watch: false
    });

    expect(result.path).toBe('/my-custom-path');
    expect(result.document).toBeDefined();
    expect(readSpy).toHaveBeenCalledWith(expect.stringContaining('my-custom-swagger.json'));
  });
});
