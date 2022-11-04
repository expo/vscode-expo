/** A predicate to filter arrays on truthy values, returning a type-safe array. */
export function truthy<T>(value: T | null | undefined): value is T {
  return !!value;
}
