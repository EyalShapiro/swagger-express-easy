import { SchemaManager } from '../../lib/swagger/schemas';

describe('SchemaManager', () => {
  let manager: SchemaManager;

  beforeEach(() => {
    manager = SchemaManager.getInstance();
    manager.clear();
  });

  test('should define a schema correctly', () => {
    manager.define('User', {
      id: { type: 'integer', required: true, example: 1 },
      username: { type: 'string', required: true, example: 'johndoe' },
    });

    const schemas = manager.getSchemas();
    expect(schemas.User).toBeDefined();
    expect(schemas.User.required).toContain('id');
    expect(schemas.User.required).toContain('username');
    expect(schemas.User.properties.id.type).toBe('integer');
    expect(schemas.User.example).toEqual({ id: 1, username: 'johndoe' });
  });

  test('should return a valid $ref string', () => {
    expect(SchemaManager.ref('User')).toBe('#/components/schemas/User');
  });
});
