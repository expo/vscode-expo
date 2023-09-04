type Debounced<T extends (...args: any) => any> = {
  /** The debounced function, without any return value */
  (...args: Parameters<T>): void;
  /** Cancel the debounced timer and prevent the function being called */
  cancel(): void;
};

/**
 * Create a function that which is called after some delay.
 * The delay timer is reset every time the function is called.
 * It's possible to fully cancel the function by using `debounce(...).cancel()`.
 */
export function debounce<T extends (...args: any) => any>(action: T, delay = 500): Debounced<T> {
  let timerId: NodeJS.Timeout | null = null;

  const cancel = () => {
    if (timerId) {
      clearTimeout(timerId);
      timerId = null;
    }
  };

  const debounced = (...args: any[]) => {
    cancel();
    timerId = setTimeout(() => action(...args), delay);
  };

  debounced.cancel = cancel;

  return debounced;
}
