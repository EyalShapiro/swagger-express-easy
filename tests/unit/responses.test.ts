import { applyCustomRouteDescriptions } from '../../lib/swagger/utils/sorted-data';
import { SwaggerRouteStore } from '../../lib/swagger/routeStore';
import * as fsHelper from '../../lib/swagger/utils/fs-helper';

jest.mock('../../lib/swagger/utils/fs-helper', () => ({
  readSwaggerFile: jest.fn(),
}));
jest.mock('../../lib/swagger/utils/path-helper', () => ({
  normalizePath: jest.fn((p) => p),
}));

describe('sortedData - Responses and Tags', () => {
  beforeEach(() => {
    SwaggerRouteStore.getData().clear();
    jest.clearAllMocks();
  });

  test('should merge responses correctly', async () => {
    // Mock the generated swagger file
    (fsHelper.readSwaggerFile as jest.Mock).mockResolvedValue({
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
    (fsHelper.readSwaggerFile as jest.Mock).mockResolvedValue({
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
