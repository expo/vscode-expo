import { requireNativeViewManager } from 'expo-modules-core';
import * as React from 'react';

export type ExampleModuleViewProps = {
  name: number;
};

type ExampleModuleViewState = {}

const NativeView: React.ComponentType<ExampleModuleViewProps> =
  requireNativeViewManager('ExampleModule');

export default class ExampleModuleView extends React.Component<ExampleModuleViewProps, ExampleModuleViewState> {
  render() {
    return <NativeView name={this.props.name} />;
  }
}
