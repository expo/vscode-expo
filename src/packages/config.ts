import { loadModuleFromProject } from '../utils/module';
import { TelemetryErrorEvent, withErrorTelemetry } from '../utils/telemetry';

/* eslint-disable import/first,import/order */

/**
 * Use a bundled version of the Expo Config package.
 * This is used to retrieve the app manifest from a project.
 *
 * @note This can get out of date and should be loaded from the project where possible.
 */
import { getConfig } from '@expo/config/build/Config';

/**
 * Use the project's `@expo/config` loader, or fallback to the bundled one.
 * The bundled one is an older version and will likely have less functionality.
 */
export function loadConfig(projectRoot: string): { getConfig: typeof getConfig } {
  const module = withErrorTelemetry(TelemetryErrorEvent.MODULE_RESOLUTION, () =>
    loadModuleFromProject<typeof import('@expo/config/build/Config')>(
      projectRoot,
      ['expo', '@expo/config'],
      'build/Config'
    )
  );

  if (module) {
    return module;
  }

  console.warn(`Falling back to bundled version of '@expo/config/build/Config'`);

  return { getConfig };
}
