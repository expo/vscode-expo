/** A predicate to filter arrays on truthy values, returning a type-safe array. */
export function truthy<T>(value: T | null | undefined): value is T {
  return !!value;
}

/** Create a predicate to filter on first occurence of a generated value within an array. */
export function uniqueBy<T>(key: (value: T) => string) {
  return (value: T, index: number, list: T[]) => {
    const identifier = key(value);
    return list.findIndex((item) => identifier === key(item)) === index;
  };
}
