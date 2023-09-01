import { NativeModulesProxy } from 'expo-modules-core';

import ExampleModuleView, { ExampleModuleViewProps } from './ExampleModuleView';

const { ExampleModule } = NativeModulesProxy;

export async function helloAsync(options: Record<string, string>) {
  return await ExampleModule.helloAsync(options);
}

export { ExampleModuleView, ExampleModuleViewProps };
