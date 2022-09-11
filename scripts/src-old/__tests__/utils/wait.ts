/**
 * Wait for the total amount of milliseconds.
 */
export async function waitFor(delay: number) {
  return new Promise((resolve) => setTimeout(resolve, delay));
}

type WaitForValueOptions = {
  /** The delay in milliseconds to wait for next attempt */
  delay?: number;
  /** Total retries allowed until returning undefined */
  retries?: number;
  /** Current total attempts made */
  attempts?: number;
};

/**
 * Wait until the action return a value, e.g. to poll certain values.
 */
export async function waitForValue<T>(
  action: () => T,
  { delay = 250, retries = 10, attempts = 0 }: WaitForValueOptions = {}
): Promise<T | undefined> {
  const value = await action();

  if (value === undefined && attempts <= retries) {
    await waitFor(delay);
    return waitForValue(action, { delay, retries, attempts: attempts + 1 });
  }

  return value;
}

export async function waitForTrue<T extends boolean | undefined | null>(
  action: () => T,
  context?: WaitForValueOptions
) {
  return waitForValue(() => (action() === true ? true : undefined), context);
}

export async function waitForFalse<T extends boolean | undefined | null>(
  action: () => T,
  context: WaitForValueOptions = {}
) {
  return waitForValue(() => (action() === false ? true : undefined), context);
}
