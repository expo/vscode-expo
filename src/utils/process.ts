/**
 * Change the working directory for a single action.
 * This is mostly used to work around `expo-modules-autolinking` limitations.
 * When loaded, it fetches the working directory not by string but by `process.cwd()`.
 */
export async function withWorkingDirectory<T>(cwd: string, action: () => Promise<T>): Promise<T> {
  const oldCwd = process.cwd();
  try {
    process.chdir(cwd);
    return await action();
  } finally {
    process.chdir(oldCwd);
  }
}
