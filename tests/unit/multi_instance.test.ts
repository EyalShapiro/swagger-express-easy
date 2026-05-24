import express from 'express';
import { SwaggerAuto } from '../../lib/swagger';
import * as fsHelper from '../../lib/swagger/utils/fs-helper';
import { SwaggerRouteStore } from '../../lib/swagger/routeStore';
import { JsonObject } from 'swagger-ui-express';

// Mock the file system utilities
jest.mock('../../lib/swagger/utils/fs-helper', () => {
  return {
    ...jest.requireActual('../../lib/swagger/utils/fs-helper'),
    readSwaggerFile: jest.fn(),
    updateSwaggerFile: jest.fn().mockResolvedValue(undefined),
    getSwaggerFilePath: jest.fn().mockReturnValue('mock-path.json'),
  };
});

// Mock swagger-autogen
jest.mock('swagger-autogen', () => () => async () => {
  return { success: true };
});

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

    // Mixed document as it would exist on disk
    mockDoc = {
      openapi: '3.0.3',
      paths: {
        '/api/users': { get: { summary: 'Get users' } },
        '/myApi/stats': { get: { summary: 'Get stats' } },
      },
    };

    // IMPORTANT: Return a CLONE so each call gets a fresh object
    (fsHelper.readSwaggerFile as jest.Mock).mockImplementation(async () => {
      return JSON.parse(JSON.stringify(mockDoc));
    });
  });

  test('each instance should only include routes matching its basePath from disk', async () => {
    const swagger1 = new SwaggerAuto(app1, {
      basePath: 'api',
      outputFile: 'swagger1.json',
    });

    const swagger2 = new SwaggerAuto(app2, {
      basePath: 'myApi',
      outputFile: 'swagger2.json',
    });

    // Check Instance 1
    const result1 = await swagger1.setup();
    const doc1 = result1.document;
    expect(Object.keys(doc1.paths)).toContain('/api/users');
    expect(Object.keys(doc1.paths)).not.toContain('/myApi/stats');

    // Check Instance 2
    const result2 = await swagger2.setup();
    const doc2 = result2.document;
    expect(Object.keys(doc2.paths)).toContain('/myApi/stats');
    expect(Object.keys(doc2.paths)).not.toContain('/api/users');
  });

  test('custom route descriptions should also be isolated by basePath even if on disk', async () => {
    SwaggerRouteStore.addRoute({
      method: 'get',
      path: '/api/special',
      description: { text: 'Special API description' },
    });
    SwaggerRouteStore.addRoute({
      method: 'get',
      path: '/myApi/secret',
      description: { text: 'Secret API description' },
    });

    // Add these to the mock disk file
    mockDoc.paths['/api/special'] = { get: {} };
    mockDoc.paths['/myApi/secret'] = { get: {} };

    const swagger1 = new SwaggerAuto(app1, { basePath: 'api' });
    const swagger2 = new SwaggerAuto(app2, { basePath: 'myApi' });

    const result1 = await swagger1.setup();
    const doc1 = result1.document;
    expect(doc1.paths['/api/special'].get.description).toBe('Special API description');
    expect(doc1.paths['/myApi/secret']).toBeUndefined();

    const result2 = await swagger2.setup();
    const doc2 = result2.document;
    expect(doc2.paths['/myApi/secret'].get.description).toBe('Secret API description');
    expect(doc2.paths['/api/special']).toBeUndefined();
  });
});
