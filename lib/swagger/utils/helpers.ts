/**
 * Merges two arrays and removes duplicates using a custom key selector.
 *
 * Items from `incoming` override matching items from `existing`.
 *
 * @template T
 * @param existing - Base items.
 * @param incoming - Items that override existing duplicates.
 * @param getKey - Returns a unique key for each item.
 * @returns A deduplicated merged array.
 *
 * @example
 * mergeByKey(
 *   [{ id: 1, value: 'old' }],
 *   [{ id: 1, value: 'new' }],
 *   (item) => String(item.id),
 * );
 * // => [{ id: 1, value: 'new' }]
 */
export function mergeByKey<T>(
  existing: T[] = [],
  incoming: T[] = [],
  getKey: (item: T) => string,
): T[] {
  const map = new Map(existing.map((item) => [getKey(item), item]));

  for (const item of incoming) map.set(getKey(item), item);

  const values = [...map.values()];
  return values;
}
