import { parseJson } from '../../lib/swagger/utils/fs-helper';

describe('parseJson', () => {
  test('should parse valid JSON', () => {
    expect(parseJson('{"a":1}')).toEqual({ a: 1 });
  });

  test('should return fallback on invalid JSON', () => {
    expect(parseJson('invalid', { fallback: true })).toEqual({ fallback: true });
  });

  test('should return fallback on empty string', () => {
    expect(parseJson('', { fallback: true })).toEqual({ fallback: true });
  });
});
