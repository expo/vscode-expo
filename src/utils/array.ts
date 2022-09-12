/** Filter a list from `null` and `undefined` values */
export function filter<T>(list: readonly (T | null | undefined)[]): T[] {
  return list.filter(Boolean) as T[];
}
