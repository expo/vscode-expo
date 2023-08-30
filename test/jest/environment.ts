import NodeEnvironment from 'jest-environment-node';

class VSCodeEnvironment extends NodeEnvironment {
  public async setup() {
    await super.setup();
    this.global.vscode = require('vscode');
  }

  public async teardown() {
    this.global.vscode = {};
    await super.teardown();
  }
}

export default VSCodeEnvironment;
