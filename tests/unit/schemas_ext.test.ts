import { defineEntity, defineEntityFromExample, SchemaManager } from '../../lib/swagger/schemas';

describe('Schema Helpers (Entity by Type)', () => {
  beforeEach(() => {
    SchemaManager.getInstance().clear();
  });

  test('defineEntity should register a schema with the correct structure', () => {
    interface User {
      id: number;
      name: string;
    }

    defineEntity<User>('User', {
      id: { type: 'integer', required: true, example: 1 },
      name: { type: 'string', required: true, example: 'John' },
    });

    const schemas = SchemaManager.getInstance().getSchemas();
    expect(schemas.User).toBeDefined();
    expect(schemas.User.properties.id.type).toBe('integer');
    expect(schemas.User.required).toContain('id');
    expect(schemas.User.required).toContain('name');
  });

  test('defineEntityFromExample should infer types correctly from an object', () => {
    const exampleProduct = {
      id: 101,
      title: 'Smartphone',
      price: 699.99,
      inStock: true,
      tags: ['electronics', 'mobile'],
    };

    defineEntityFromExample('Product', exampleProduct);

    const schemas = SchemaManager.getInstance().getSchemas();
    expect(schemas.Product).toBeDefined();
    expect(schemas.Product.properties.id.type).toBe('integer');
    expect(schemas.Product.properties.title.type).toBe('string');
    expect(schemas.Product.properties.price.type).toBe('number');
    expect(schemas.Product.properties.inStock.type).toBe('boolean');
    expect(schemas.Product.properties.tags.type).toBe('array');

    // Check examples are preserved
    expect(schemas.Product.properties.title.example).toBe('Smartphone');
  });

  test('defineEntityFromExample should handle null or nested objects gracefully', () => {
    const complexObj = {
      metadata: { version: 1 },
      optional: null,
    };

    defineEntityFromExample('Complex', complexObj as any);

    const schemas = SchemaManager.getInstance().getSchemas();
    expect(schemas.Complex.properties.metadata.type).toBe('object');
    expect(schemas.Complex.properties.optional.type).toBe('string'); // Default fallback
  });
});
