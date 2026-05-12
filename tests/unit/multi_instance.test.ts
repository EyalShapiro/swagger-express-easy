import express from 'express';
import { SwaggerAuto } from '../../lib/swagger';
import * as functions from '../../lib/swagger/utils/functions';
import { SwaggerRouteStore } from '../../lib/swagger/routeStore';
import { JsonObject } from 'swagger-ui-express';

// Mock the file system utilities
jest.mock('../../lib/swagger/utils/functions', () => ({
  ...jest.requireActual('../../lib/swagger/utils/functions'),
  readSwaggerFile: jest.fn(),
  updateSwaggerFile: jest.fn().mockResolvedValue(undefined),
  getSwaggerFilePath: jest.fn().mockReturnValue('mock-path.json')
}));

// Mock swagger-autogen
jest.mock('swagger-autogen', () => () => async () => ({ success: true }));

describe('Multi-Instance Swagger Isolation', () => {
  let app1: any;
  let app2: any;
  let mockDoc: JsonObject;

  beforeEach(() => {
    app1 = express();
    app2 = express();
    jest.clearAllMocks();
    
    // Clear the global route store
    SwaggerRouteStore.getData().clear();

    // Mixed document
    mockDoc = {
      openapi: '3.0.3',
      paths: {
        '/api/users': { get: { summary: 'Get users' } },
        '/myApi/stats': { get: { summary: 'Get stats' } },
      }
    };

    (functions.readSwaggerFile as jest.Mock).mockResolvedValue(mockDoc);
  });

  test('each instance should only include routes matching its basePath', async () => {
    const swagger1 = new SwaggerAuto(app1, {
      basePath: 'api',
      outputFile: 'swagger1.json'
    });

    const swagger2 = new SwaggerAuto(app2, {
      basePath: 'myApi',
      outputFile: 'swagger2.json'
    });

    await swagger1.setup();
    
    // Check if updateSwaggerFile was called
    expect(functions.updateSwaggerFile).toHaveBeenCalled();
    
    const doc1 = (functions.updateSwaggerFile as jest.Mock).mock.calls[0][0];
    expect(Object.keys(doc1.paths)).toContain('/api/users');
    expect(Object.keys(doc1.paths)).not.toContain('/myApi/stats');

    await swagger2.setup();
    const doc2 = (functions.updateSwaggerFile as jest.Mock).mock.calls[1][0];
    expect(Object.keys(doc2.paths)).toContain('/myApi/stats');
    expect(Object.keys(doc2.paths)).not.toContain('/api/users');
  });

  test('custom route descriptions should also be isolated by basePath', async () => {
    SwaggerRouteStore.addRoute({
      method: 'get',
      path: '/api/special',
      description: { text: 'Special API description' }
    });
    SwaggerRouteStore.addRoute({
      method: 'get',
      path: '/myApi/secret',
      description: { text: 'Secret API description' }
    });

    mockDoc.paths['/api/special'] = { get: {} };
    mockDoc.paths['/myApi/secret'] = { get: {} };

    const swagger1 = new SwaggerAuto(app1, { basePath: 'api' });
    const swagger2 = new SwaggerAuto(app2, { basePath: 'myApi' });

    await swagger1.setup();
    const doc1 = (functions.updateSwaggerFile as jest.Mock).mock.calls[0][0];
    expect(doc1.paths['/api/special'].get.description).toBe('Special API description');
    expect(doc1.paths['/myApi/secret']).toBeUndefined();

    await swagger2.setup();
    const doc2 = (functions.updateSwaggerFile as jest.Mock).mock.calls[1][0];
    expect(doc2.paths['/myApi/secret'].get.description).toBe('Secret API description');
    expect(doc2.paths['/api/special']).toBeUndefined();
  });
});
