/**
 * Merges arrays of objects by a specific key without doing expensive deep clones.
 * Favors the incoming (newer) objects when keys collide.
 *
 * @template T - Object type with string-keyed properties.
 * @param {T[] | undefined} existing - The current array (may be `undefined`).
 * @param {T[]} incoming - New items to merge in.
 * @param {(item: T) => string} keyFn - Extracts the unique key from each item.
 * @returns {T[]} Merged array with duplicates resolved in favor of `incoming`.
 * @example
 * mergeByKey(oldTags, newTags, (t) => t.name);
 */
export function mergeByKey<T extends Record<string, unknown>>(
  existing: T[] | undefined,
  incoming: T[],
  keyFn: (item: T) => string,
): T[] {
  if (!existing || existing.length === 0) return incoming;

  const map = new Map<string, T>();
  for (const item of existing) {
    map.set(keyFn(item), item);
  }
  for (const item of incoming) {
    map.set(keyFn(item), item);
  }

  return Array.from(map.values());
}

export function cloneDocument<T>(obj: T, defaultValue: Partial<T> = {}): T | Partial<T> {
  try {
    return JSON.parse(JSON.stringify(obj));
  } catch {
    return defaultValue ?? {};
  }
}
