export function mapToObject<K extends string | number | symbol, V>(
  map: Map<K, V>,
): Record<K, V> {
  const result = {} as Record<K, V>;
  map.forEach((value, key) => {
    result[key] = value;
  });
  return result;
}
