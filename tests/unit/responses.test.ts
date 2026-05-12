import { applyCustomRouteDescriptions } from '../../lib/swagger/utils/sortedData';
import { SwaggerRouteStore } from '../../lib/swagger/routeStore';
import * as functions from '../../lib/swagger/utils/functions';

jest.mock('../../lib/swagger/utils/functions', () => ({
  readSwaggerFile: jest.fn(),
  normalizePath: jest.fn((p) => p),
}));

describe('sortedData - Responses and Tags', () => {
  beforeEach(() => {
    SwaggerRouteStore.getData().clear();
    jest.clearAllMocks();
  });

  test('should merge responses correctly', async () => {
    // Mock the generated swagger file
    (functions.readSwaggerFile as jest.Mock).mockResolvedValue({
      paths: {
        '/api/test': {
          get: {
            responses: {
              200: { description: 'Default OK' },
            },
          },
        },
      },
    });

    SwaggerRouteStore.addRoute({
      method: 'get',
      path: '/api/test',
      responses: {
        404: { description: 'Not Found Custom' },
        200: { description: 'Overridden OK' },
      },
    });

    const result = await applyCustomRouteDescriptions('fake-path');

    expect(result.paths['/api/test'].get.responses['404']).toBeDefined();
    expect(result.paths['/api/test'].get.responses['404'].description).toBe('Not Found Custom');
    expect(result.paths['/api/test'].get.responses['200'].description).toBe('Overridden OK');
  });

  test('should gracefully handle empty responses', async () => {
    (functions.readSwaggerFile as jest.Mock).mockResolvedValue({
      paths: {
        '/api/empty': {
          get: { responses: { 200: { description: 'OK' } } },
        },
      },
    });

    SwaggerRouteStore.addRoute({
      method: 'get',
      path: '/api/empty',
      // no responses specified
    });

    const result = await applyCustomRouteDescriptions('fake-path');
    expect(result.paths['/api/empty'].get.responses['200']).toBeDefined();
  });
});
