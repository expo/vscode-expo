import NodeEnvironment from 'jest-environment-node';
import * as vscode from 'vscode';

export default class VsCodeEnvironment extends NodeEnvironment {
  public async setup() {
    await super.setup();
    this.global.vscode = vscode;
  }

  public async teardown() {
    this.global.vscode = {};
    await super.teardown();
  }
}
