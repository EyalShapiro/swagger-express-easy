import { normalizePath } from '../../lib/swagger/utils/functions';

describe('normalizePath', () => {
  test('should add leading slash if missing', () => {
    expect(normalizePath('users')).toBe('/users');
  });

  test('should handle already normalized path', () => {
    expect(normalizePath('/users')).toBe('/users');
  });

  test('should remove trailing slash', () => {
    expect(normalizePath('/users/')).toBe('/users');
  });

  test('should handle root path', () => {
    expect(normalizePath('/')).toBe('/');
    expect(normalizePath('')).toBe('/');
  });

  test('should handle complex paths', () => {
    expect(normalizePath('api/v1/messages/')).toBe('/api/v1/messages');
  });
});
